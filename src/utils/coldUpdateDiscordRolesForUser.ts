import { GuildMember, Role } from "discord.js";
import { LunarAssistant } from "../index";
import { GuildConfig, User, Whitelist } from "../shared/firestoreTypes";
import { UpdateUserDiscordRolesResponse,
        ContractAddresses } from "../types";
import { checkRulesQualifies } from "./checkRuleQualifies";
import {
  getContractAddressesRelevantToGuildConfig,
  getRelevantContractAddressesForUserID,
} from "./getRelevantContractAddresses";
import { getWalletContents } from "./getWalletContents";
import {
  guildRoleDictToGuildRoleNameDict,
  uniqueRoleFilter,
} from "./helper";
import { updateAddedPersistedRemovedRoles } from "./updateActiveRemovedRoles";

export async function coldUpdateDiscordRolesForUser(
  this: LunarAssistant,
  userID: string,
  userDoc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>,
  guildConfigsSnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  whitelist: Whitelist,
): Promise<UpdateUserDiscordRolesResponse> {
  // Get the users wallet address
  const walletAddress = (userDoc.data() as User).wallet;

  const benchmark = {
    functions: {
      getAddedPersistedRemovedRoleIds: {
        start: 0,
        end: 0,
        diff: 0,
      },
      propogateRoleUpdates: {
        start: 0,
        end: 0,
        diff: 0,
      },
    },
  };

  benchmark.functions.getAddedPersistedRemovedRoleIds.start = Date.now();

  const { activeRoles, inactiveRoles } = await getActiveInactiveRoleIds(
    this,
    userID,
    walletAddress,
    guildConfigsSnapshot,
    whitelist,
  );

  benchmark.functions.getAddedPersistedRemovedRoleIds.end = Date.now();
  benchmark.functions.getAddedPersistedRemovedRoleIds.diff =
    benchmark.functions.getAddedPersistedRemovedRoleIds.end -
    benchmark.functions.getAddedPersistedRemovedRoleIds.start;

  benchmark.functions.propogateRoleUpdates.start = Date.now();

  const { addedRoles, persistedRoles, removedRoles } =
    await propogateRoleUpdates(
      this,
      userID,
      guildConfigsSnapshot,
      activeRoles,
      inactiveRoles
    );

  benchmark.functions.propogateRoleUpdates.end = Date.now();
  benchmark.functions.propogateRoleUpdates.diff =
    benchmark.functions.propogateRoleUpdates.end -
    benchmark.functions.propogateRoleUpdates.start;

  console.log(benchmark);

  const addedRoleNames = guildRoleDictToGuildRoleNameDict(addedRoles);
  const persistedRoleNames = guildRoleDictToGuildRoleNameDict(persistedRoles);
  const removedRoleNames = guildRoleDictToGuildRoleNameDict(removedRoles);

  console.log(`Got all tokens and updated roles for ${walletAddress}:`, {
    addedRoles: addedRoleNames,
    persistedRoles: persistedRoleNames,
    removedRoles: removedRoleNames,
  });

  // Return the list of the users active roles and removed roles
  return {
    addedRoleNames,
    persistedRoleNames,
    removedRoleNames,
  };
}

export const getActiveInactiveRoleIds = async (
  lunar: LunarAssistant,
  userID: string,
  walletAddress: string,
  guildConfigsSnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  whitelist: Whitelist
) => {
  let start;;
  const relevantContractAddresses : ContractAddresses =
  await getRelevantContractAddressesForUserID(guildConfigsSnapshot, userID, lunar);
  
  const userTokensCache = await getWalletContents(
    walletAddress,
    relevantContractAddresses,
  );

  // Mapping from discord server id to a list of active role ids
  const activeRoles: { [guildId: string]: Role[] } = {};

  // Mapping from discord server id to a list of inactive role ids
  const inactiveRoles: { [guildId: string]: Role[] } = {};

  const updateActivePersistedRemovedRolesForGuildConfigDoc = async (
    guildConfigDoc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>
  ) => {
    start = Date.now();
    // If lunar is null than we want to query across all guilds
    // Get the guild from the discord client
    const guild = lunar.client.guilds.cache.get(guildConfigDoc.id);
    if (!guild) return;
    const guildId = guildConfigDoc.id;

    // Get the member from the guild
    let member: GuildMember;

    try {
      member = await guild.members.fetch(userID);
      console.log("after member fetch: " + (Date.now()-start));
      if (!member) return;
    } catch (e) {
      // Member doesn't exist in guild
      return;
    }
    
    activeRoles[guildId] = [];
    inactiveRoles[guildId] = [];

    // Get the guild rules
    const guildRules = (guildConfigDoc.data() as GuildConfig).rules;
    console.log("before looping guildRules: " + (Date.now()-start));
    // Iterate over the guild rules
    for (const guildRule of guildRules) {
      // Get the role corresponding to the guildRule
      const newRole = guild.roles.cache.find(
        (role) => role.id == guildRule.roleId
      );

      // If rule doesn't exist, skip
      if (!newRole) {
        console.error(`No role with that id: ${guildRule.roleId}`);
        continue;
      }

      // Get ruleQualifies and hasRole
      let roleActive: boolean = await checkRulesQualifies(
        guildRule,
        userTokensCache,
        walletAddress
      );

      if (roleActive) {
        activeRoles[guildId].push(newRole);
        //console.log("Pushing activeRole: " + newRole);
      } else {
        inactiveRoles[guildId].push(newRole);
        //console.log("Pushing InactiveRole: " + newRole);
      }
    }
    console.log("after looping guildRules: " + (Date.now()-start));
    // Get unique active role ids
    activeRoles[guildId] = activeRoles[guildId].reduce(
      uniqueRoleFilter,
      [] as Role[]
    );

    // Get unique inactive roles
    // active roles take priority over inactive roles
    inactiveRoles[guildId] = inactiveRoles[guildId]
      .reduce(uniqueRoleFilter, [] as Role[])
      .filter((x) => !activeRoles[guildId].some((i) => i.id == x.id));
      console.log("finished 1 guildDoc " + (Date.now()-start));
  };
  
  start = Date.now();
  for(let index = 0; index < guildConfigsSnapshot.docs.length; index++)
  {
    const guildDoc = guildConfigsSnapshot.docs[index];
    const whitelisted = whitelist.serverIds.find((id) => id == guildDoc.id)
    
    //if request did not come from observer || server is whitelisted then update
    if(whitelist.serverIds.length == 0 || whitelisted != undefined) {
      await updateActivePersistedRemovedRolesForGuildConfigDoc(guildDoc);
    }
  }
  const end = Date.now();
  console.log("whitelist check takes: " + (end-start));

  // Return role states
  return {
    activeRoles,
    inactiveRoles,
  };
};

export const getActiveInactiveRoleIdsForGuildConfigDoc = async (
  lunar: LunarAssistant,
  userID: string,
  walletAddress: string,
  guildConfigDoc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
) => {
  const guildConfig = guildConfigDoc.data() as GuildConfig;
  const relevantContractAddresses =
    getContractAddressesRelevantToGuildConfig(guildConfig);

  const userTokensCache = await getWalletContents(
    walletAddress,
    relevantContractAddresses,
  );

  // Mapping from discord server id to a list of active role ids
  const activeRoles: { [guildId: string]: Role[] } = {};

  // Mapping from discord server id to a list of inactive role ids
  const inactiveRoles: { [guildId: string]: Role[] } = {};

  const updateActivePersistedRemovedRolesForGuildConfigDoc = async (
    guildConfigDoc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
  ) => {
    // If lunar is null than we want to query across all guilds
    // Get the guild from the discord client
    const guild = lunar.client.guilds.cache.get(guildConfigDoc.id);
    if (!guild) return;
    const guildId = guildConfigDoc.id;

    // Get the member from the guild
    let member: GuildMember;
    
    try {
      member = await guild.members.fetch(userID);
      if (!member) return;
    } catch (e) {
      // Member doesn't exist in guild
      return;
    }

    activeRoles[guildId] = [];
    inactiveRoles[guildId] = [];

    // Get the guild rules
    const guildRules = (guildConfigDoc.data() as GuildConfig).rules;

    // Iterate over the guild rules
    for (const guildRule of guildRules) {
      // Get the role corresponding to the guildRule
      const newRole = guild.roles.cache.find(
        (role) => role.id == guildRule.roleId
      );

      // If rule doesn't exist, skip
      if (!newRole) {
        console.error(`No role with that id: ${guildRule.roleId}`);
        continue;
      }

      // Get ruleQualifies and hasRole
      let roleActive: boolean = await checkRulesQualifies(
        guildRule,
        userTokensCache,
        walletAddress
      );

      if (roleActive) {
        activeRoles[guildId].push(newRole);
      } else {
        inactiveRoles[guildId].push(newRole);
      }
    }

    // Get unique active role ids
    activeRoles[guildId] = activeRoles[guildId].reduce(
      uniqueRoleFilter,
      [] as Role[]
    );

    // Get unique inactive roles
    // active roles take priority over inactive roles
    inactiveRoles[guildId] = inactiveRoles[guildId]
      .reduce(uniqueRoleFilter, [] as Role[])
      .filter((x) => !activeRoles[guildId].some((i) => i.id == x.id));
  };

  // Process guild config
  await updateActivePersistedRemovedRolesForGuildConfigDoc(guildConfigDoc);

  // Return role states
  return {
    activeRoles,
    inactiveRoles,
  };
};

export const propogateRoleUpdates = async (
  lunar: LunarAssistant,
  userID: string,
  guildConfigsSnapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>,
  activeRoles: { [guildId: string]: Role[] },
  inactiveRoles: { [guildId: string]: Role[] }
) => {
  // Mapping from discord server name to a list of added role names
  const addedRoles: { [guildId: string]: Role[] } = {};

  // Mapping from discord server name to a list of persisted role names
  const persistedRoles: { [guildId: string]: Role[] } = {};

  // Mapping from discord server name to a list of removed roles names
  const removedRoles: { [guildId: string]: Role[] } = {};

  const propogateRoleUpdatesForGuildConfigDoc = async (
    guildConfigDoc: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>
  ) => {
    // Get the guild from the discord client
    const guild = lunar.client.guilds.cache.get(guildConfigDoc.id);
    if (!guild) return;
    const guildId = guildConfigDoc.id;

    // Get the member from the guild
    let member: GuildMember;

    try {
      member = await guild.members.fetch(userID);
      if (!member) return;
    } catch (e) {
      // Member doesn't exist in guild
      return;
    }

    addedRoles[guildId] = [];
    persistedRoles[guildId] = [];
    removedRoles[guildId] = [];

    try {
      updateAddedPersistedRemovedRoles(
        guildId,
        member,
        activeRoles,
        inactiveRoles,
        addedRoles,
        persistedRoles,
        removedRoles
      );
    } catch (e) {
      console.log("exception in updateAddedPersistedRemovedRoles: " + e);
    }

    if (addedRoles[guildId].length > 0) {
      try {
        member = await member.roles.add(addedRoles[guildId]);
        console.log(
          "Roles added for userId: " +
            userID +
            " guildId: " +
            guildId +
            " roles: " +
            addedRoles[guildId]
        );
      } catch (e) {
        console.error(
          "Couldn't add role, probably because of role hierarchy.",
          guild.name,
          addedRoles[guildId]
        );
      }
    }

    if (removedRoles[guildId].length > 0) {
      try {
        member = await member.roles.remove(removedRoles[guildId]);
        console.log(
          "Roles removed for userId: " +
            userID +
            " guildId: " +
            guildId +
            " roles: " +
            removedRoles[guildId]
        );
      } catch (e) {
        console.error(
          "Couldn't remove role, probably because of role hierarchy.",
          guild.name,
          removedRoles[guildId]
        );
      }
    }
  };
  
  for(let index = 0; index < guildConfigsSnapshot.docs.length; index++)
  {
    const guildDoc = guildConfigsSnapshot.docs[index];
    await propogateRoleUpdatesForGuildConfigDoc(guildDoc);
  }

  // Return the list of the users active roles and removed roles
  return {
    addedRoles,
    persistedRoles,
    removedRoles,
  };
};

export const propogateRoleUpdatesForGuildConfigDoc = async (
  lunar: LunarAssistant,
  userID: string,
  guildConfigDoc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>,
  activeRoles: { [guildId: string]: Role[] },
  inactiveRoles: { [guildId: string]: Role[] }
) => {
  // Mapping from discord server name to a list of added role names
  const addedRoles: { [guildId: string]: Role[] } = {};

  // Mapping from discord server name to a list of persisted role names
  const persistedRoles: { [guildId: string]: Role[] } = {};

  // Mapping from discord server name to a list of removed roles names
  const removedRoles: { [guildId: string]: Role[] } = {};

  const propogateRoleUpdatesForGuildConfigDoc = async (
    guildConfigDoc: FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>
  ) => {
    // Get the guild from the discord client
    const guild = lunar.client.guilds.cache.get(guildConfigDoc.id);
    if (!guild) return;
    const guildId = guildConfigDoc.id;

    // Get the member from the guild
    let member: GuildMember;

    try {
      member = await guild.members.fetch(userID);
      if (!member) return;
    } catch (e) {
      // Member doesn't exist in guild
      return;
    }

    addedRoles[guildId] = [];
    persistedRoles[guildId] = [];
    removedRoles[guildId] = [];

    updateAddedPersistedRemovedRoles(
      guildId,
      member,
      activeRoles,
      inactiveRoles,
      addedRoles,
      persistedRoles,
      removedRoles
    );

    if (addedRoles[guildId].length > 0) {
      try {
        member = await member.roles.add(addedRoles[guildId]);
        console.log(
          "Roles added for userId: " +
            userID +
            " guildId: " +
            guildId +
            " roles: " +
            addedRoles[guildId]
        );
      } catch (e) {
        console.error(
          "Couldn't add role, probably because of role hierarchy.",
          guild.name,
          addedRoles[guildId]
        );
      }
    }

    if (removedRoles[guildId].length > 0) {
      try {
        member = await member.roles.remove(removedRoles[guildId]);
        console.log(
          "Roles removed for userId: " +
            userID +
            " guildId: " +
            guildId +
            " roles: " +
            removedRoles[guildId]
        );
      } catch (e) {
        console.error(
          "Couldn't remove role, probably because of role hierarchy.",
          guild.name,
          removedRoles[guildId]
        );
      }
    }
  };

  // Propogate role updates
  await propogateRoleUpdatesForGuildConfigDoc(guildConfigDoc);

  // Return the list of the users active roles and removed roles
  return {
    addedRoles,
    persistedRoles,
    removedRoles,
  };
};

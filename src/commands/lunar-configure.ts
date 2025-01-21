import { SlashCommandBuilder } from "@discordjs/builders";
import {
  APIRole,
  AttachmentBuilder,
  AutocompleteInteraction,
  ButtonInteraction,
  ChatInputCommandInteraction,
  Role,
} from "discord.js";
import { LunarAssistant } from "..";
import chains from "../../blockchains.json";
import { api } from "../services/api";
import repository from "../services/repository";
import {
  apiRuleData,
  GenericRule,
  nftRuleData,
  stakedNftRuleData,
  tokenRuleData,
} from "../shared/apiTypes";
import { ComplexRuleMode } from "../types";
import { createComplexRuleButtons } from "../utils/buttons";
import {
  createComplexRuleEmbed,
  createCrossChainRuleEmbed,
} from "../utils/embeds";
import {
  generateExpression,
  isValidHttpUrl,
  shuffleArray,
} from "../utils/helper";
import { isBlockchainEnabled } from "../utils/isBlockchainEnabled";
import { isValidAddress } from "../utils/isValidAddress";
import { customExpressionModal } from "../utils/modals";
import { RULE_ID_REGEX } from "../utils/regex";
const logger = require("../logging/logger");

export default {
  data: new SlashCommandBuilder()
    .setName("lunar-configure")
    .setDescription("Configures the lunar assistant")
    .setDefaultPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add-nft-rule")
        .setDescription(
          "Adds a rule for granting a role to users based on nft ownership."
        )
        .addStringOption((option) =>
          option
            .setName("blockchain")
            .setDescription(
              "The blockchain name to which the nft-address belongs."
            )
            .setRequired(true)
            .addChoices(
              ...Object.entries(chains)
                .filter(([_, value]) => value.enabled && value.support.nftRule)
                .map(([_, value]) => {
                  return {
                    name: value.name,
                    value: value.value,
                  };
                })
            )
        )
        .addStringOption((option) =>
          option
            .setName("nft-address")
            .setDescription(
              "The contract address against which to check for nft ownership for this rule."
            )
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The role to give to users which meet this rule.")
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("quantity")
            .setDescription(
              "The quantity of matching nfts that a user must hold in order to meet the rule."
            )
        )
        .addStringOption((option) =>
          option
            .setName("token-ids")
            .setDescription(
              "A list of token ids that the rule is restricted to."
            )
        )
    ) /* disabled for now until correctly implemented on backend with event based design
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add-staked-nft-rule")
        .setDescription(
          "Adds a rule for granting a role to users based on nft staking."
        )
        .addStringOption((option) =>
          option
            .setName("nft-address")
            .setDescription(
              "The contract address against which to check for nft ownership for this rule."
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("staked-nft-address")
            .setDescription(
              "The contract address against which to check for nft staking for this rule."
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("blockchain")
            .setDescription(
              "The blockchain name to which the nft-address belongs."
            )
            .setRequired(true)
            .addChoices(
              {
                value: "Terra",
                name: "Terra",
              },
              {
                value: "Terra Classic",
                name: "Terra Classic",
              },
              {
                value: "polygon-mainnet",
                name: "Polygon",
              },
              {
                value: "Stargaze",
                name: "Stargaze",
              },
              // {
              //   value: "Archway",
              //   name: "Archway",
              // },
              // {
              //   value: "Juno",
              //   name: "Juno",
              // },
              // {
              //   value: "Osmosis",
              //   name: "Osmosis",
              // },
              // {
              //   value: "Neutron",
              //   name: "Neutron",
              // },
              {
                value: "Injective",
                name: "Injective",
              },
              // {
              //   value: "Migaloo",
              //   name: "Migaloo",
              // }
            )
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The role to give to users which meet this rule.")
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("quantity")
            .setDescription(
              "The quantity of matching nfts that a user must hold in order to meet the rule."
            )
        )
        .addStringOption((option) =>
          option
            .setName("token-ids")
            .setDescription(
              "A list of token ids that the rule is restricted to."
            )
        )
    )*/
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add-token-rule")
        .setDescription(
          "Adds a rule for granting a role to users based on token/coin ownership."
        )
        .addStringOption((option) =>
          option
            .setName("blockchain")
            .setDescription(
              "The blockchain name to which the nft-address belongs."
            )
            .setRequired(true)
            .addChoices(
              ...Object.values(chains)
                .filter((value) => value.enabled)
                .map((value) => {
                  return {
                    name:
                      value.name +
                      (value.support.nftRule && !value.support.tokenRule
                        ? " [No Token Support! Use NFT-Rules]"
                        : ""),
                    value: value.value,
                  };
                })
            )
        )
        .addStringOption((option) =>
          option
            .setName("token-address")
            .setDescription(
              "The contract address against which to check for token/coin ownership for this rule."
            )
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The role to give to users which meet this rule.")
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("quantity")
            .setDescription(
              "The quantity of matching token tokens that a user must hold in order to meet the rule."
            )
        )
    ) /*
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add-api-rule")
        .setDescription(
          "Adds a rule for granting a role to a user based on the response of your custom API."
        )
        .addStringOption((option) =>
          option
            .setName("api-url")
            .setDescription(
              "Format: 'https://yourApiUrl.com?wallet=$(wallet)' $(wallet) will be replaced by user wallet address"
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("blockchain")
            .setDescription(
              "The blockchain name to which the nft-address belongs."
            )
            .setRequired(true)
            .addChoices(
              {
                value: "Terra",
                name: "Terra",
              },
              {
                value: "Terra Classic",
                name: "Terra Classic",
              },
              {
                value: "polygon-mainnet",
                name: "Polygon",
              },
              {
                value: "Stargaze",
                name: "Stargaze",
              },
              {
                value: "Archway",
                name: "Archway",
              }
            )
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The role to give to users which meet this rule.")
            .setRequired(true)
        )
    )*/
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add-complex-rule")
        .setDescription(
          "Adds a complex rule for granting a role to users based on multiple conditions."
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The role to give to users which meet this rule.")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add-cross-chain-rule")
        .setDescription(
          "Adds a rule for granting a role to users based on cross-chain collections."
        )
        .addIntegerOption((option) =>
          option
            .setName("collection")
            .setDescription(
              "The collection to check for cross-chain ownership."
            )
            .setRequired(true)
            .setAutocomplete(true)
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription("The role to give to users which meet this rule.")
            .setRequired(true)
        )
        .addNumberOption((option) =>
          option
            .setName("quantity")
            .setDescription(
              "The quantity of matching nfts that a user must hold in order to meet the rule. (Default: 1)"
            )
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view-rules")
        .setDescription("View the rules currently configured for the server.")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove-rule")
        .setDescription(
          "Remove a rule based on its index in the output of `/list-rules`"
        )
        .addStringOption((option) =>
          option
            .setName("rule-id")
            .setDescription("The id of the rule to remove.")
            .setRequired(true)
            .setAutocomplete(true)
        )
    ),
  execute: async (
    lunarAssistant: LunarAssistant,
    interaction: ChatInputCommandInteraction
  ) => {
    // verify the interaction is valid
    if (!interaction.guildId || !interaction.guild || !interaction.member)
      return;

    await interaction.deferReply({ ephemeral: true });

    let nftAddress: string;
    let stakedNftAddress: string;
    let blockchainName: string;
    let role: Role | APIRole;
    let rawQuantity: number;
    let rawTokenIds: string | undefined;
    let tokenAddress: string;
    let apiUrl: string;
    let ruleNumber: string;
    let tokenIdArray: string[] = [];

    switch (interaction.options.getSubcommand(true)) {
      case "add-nft-rule":
        // configure the server settings
        nftAddress = interaction.options
          .getString("nft-address", true)
          .toLowerCase();
        blockchainName = interaction.options.getString("blockchain", true);
        role = interaction.options.getRole("role", true);
        rawQuantity = interaction.options.getNumber("quantity") ?? 1;
        rawTokenIds = interaction.options.getString("token-ids") ?? undefined;

        if (!isBlockchainEnabled(blockchainName, "nftRule")) {
          await interaction.editReply({
            content: "NFT rules are not supported on this blockchain.",
          });
          return;
        }

        if (!isValidAddress(nftAddress, blockchainName)) {
          await interaction.editReply({
            content: "Invalid address",
          });
          return;
        }

        // verify that we can parse tokenIds
        try {
          if (rawTokenIds) {
            if (
              rawTokenIds.includes("[") ||
              rawTokenIds.includes("]") ||
              rawTokenIds.includes("'") ||
              rawTokenIds.includes('"')
            ) {
              throw new Error(`Invalid character in tokenIds`);
            }
            tokenIdArray = rawTokenIds.split(",").map((s) => s.trim());
          }
        } catch {
          await interaction.editReply({
            content:
              "Could not parse token ids, please list token ids using a coma , to separate values like so: 152, 19, 421",
          });
          return;
        }

        // check if the bot role is above the verified role
        if (
          role.position > interaction.guild.members.me!.roles.highest.position
        ) {
          await interaction.editReply({
            content: `Please update the role hierarchy with my highest role above of ${role.name} and try again.`,
          });
          return;
        }

        const addNftRuleData: nftRuleData = {
          nftAddress: nftAddress,
          tokenIds: tokenIdArray,
          quantity: rawQuantity,
          quantityOperatorName: "Greater Than Or Equals",
          role: role.id,
          discordServerId: interaction.guild.id,
          blockchainName: blockchainName,
          discordChannelId:
            typeof interaction.channel?.id! === "string"
              ? interaction.channel?.id!
              : "",
          discordMessageId: "",
        };

        try {
          await api.addNftRule(addNftRuleData);
        } catch (e) {
          logger.error(e);
          await interaction.editReply({
            content:
              "Could not create the rule for this server, please try again later. Please note that there is temporary hard cap of 20k tokens maximum for nft collections. Contact us if this is an issue.",
          });
          return;
        }

        // reply
        await interaction.editReply({
          content:
            "Rule added successfully! Please note that it takes time for the system to index the collection if it is not already in the database. Expect about 1 hour per 10k tokens in the collection.",
        });
        break;

      case "add-staked-nft-rule":
        // configure the server settings
        nftAddress = interaction.options
          .getString("nft-address", true)
          .toLowerCase();
        stakedNftAddress = interaction.options
          .getString("staked-nft-address", true)
          .toLowerCase();
        blockchainName = interaction.options.getString("blockchain", true);
        role = interaction.options.getRole("role", true);
        rawQuantity = interaction.options.getNumber("quantity") ?? 1;
        rawTokenIds = interaction.options.getString("token-ids") ?? undefined;

        if (!isBlockchainEnabled(blockchainName, "tokenRule")) {
          await interaction.editReply({
            content: "Token Rules are not supported on this blockchain.",
          });
          return;
        }

        if (!isValidAddress(nftAddress, blockchainName)) {
          await interaction.editReply({
            content: "Invalid address",
          });
          return;
        }

        if (!isValidAddress(stakedNftAddress, blockchainName)) {
          await interaction.editReply({
            content: "Invalid staked address",
          });
          return;
        }

        // verify that we can parse tokenIds
        try {
          if (rawTokenIds) {
            if (
              rawTokenIds.includes("[") ||
              rawTokenIds.includes("]") ||
              rawTokenIds.includes("'") ||
              rawTokenIds.includes('"')
            ) {
              throw new Error(`Invalid character in tokenIds`);
            }
            tokenIdArray = rawTokenIds.split(",").map((s) => s.trim());
          }
        } catch {
          await interaction.editReply({
            content:
              "Could not parse token ids, please list token ids using a coma , to seperate values like so: 152, 19, 421",
          });
          return;
        }

        // check if the bot role is above the verified role
        if (
          role.position > interaction.guild.members.me!.roles.highest.position
        ) {
          await interaction.editReply({
            content: `Please update the role hierarchy with my highest role above of ${role.name} and try again.`,
          });
          return;
        }

        const addStakedNftRuleData: stakedNftRuleData = {
          nftAddress: nftAddress,
          stakedNftAddress: stakedNftAddress,
          tokenIds: tokenIdArray,
          quantity: rawQuantity,
          quantityOperatorName: "Greater Than Or Equals",
          role: role.id,
          discordServerId: interaction.guild.id,
          blockchainName: blockchainName,
        };

        try {
          await api.addStakedNftRule(addStakedNftRuleData);
        } catch (e) {
          logger.error(e);
          await interaction.editReply({
            content:
              "Could not create the rule for this server, please try again later.",
          });
          return;
        }

        // reply
        await interaction.editReply({
          content: "Rule added successfully!",
        });
        break;

      case "add-token-rule":
        // configure the server settings
        tokenAddress = interaction.options
          .getString("token-address", true)
          .toLowerCase();
        blockchainName = interaction.options.getString("blockchain", true);
        role = interaction.options.getRole("role", true);
        rawQuantity = interaction.options.getNumber("quantity") ?? 1;

        if (!isValidAddress(tokenAddress, blockchainName)) {
          await interaction.editReply({
            content: "Invalid address",
          });
          return;
        }

        // Check if the bot role is above the verified role
        if (
          role.position > interaction.guild.members.me!.roles.highest.position
        ) {
          await interaction.editReply({
            content: `Please update the role hierarchy with my highest role above of ${role.name} and try again.`,
          });
          return;
        }

        const addtokenRuleData: tokenRuleData = {
          tokenAddress: tokenAddress,
          blockchainName: blockchainName,
          quantity: rawQuantity,
          quantityOperatorName: "Greater Than Or Equals",
          role: role.id,
          discordChannelId:
            typeof interaction.channel?.id! === "string"
              ? interaction.channel?.id!
              : "",
          discordServerId: interaction.guild.id,
        };

        try {
          await api.addTokenRule(addtokenRuleData);
        } catch (e) {
          logger.error(e);
          await interaction.editReply({
            content:
              "Could not create the rule for this server, please try again later.",
          });
          return;
        }

        // reply
        await interaction.editReply({
          content: "Rule added successfully!",
        });
        break;

      case "add-api-rule":
        // configure the server settings
        apiUrl = interaction.options.getString("api-url", true);
        blockchainName = interaction.options.getString("blockchain", true);
        role = interaction.options.getRole("role", true);

        if (!isValidHttpUrl(apiUrl)) {
          //Verify url is valid
          await interaction.editReply({
            content: "api-url is not a valid url",
          });
          return;
        }

        // check if the bot role is above the verified role
        if (
          role.position > interaction.guild.members.me!.roles.highest.position
        ) {
          await interaction.editReply({
            content: `Please update the role hierarchy with my highest role above of ${role.name} and try again.`,
          });
          return;
        }

        const addApiRule: apiRuleData = {
          apiUrl: apiUrl,
          blockchainName: blockchainName,
          role: role.id,
          discordServerId: interaction.guild.id,
        };

        try {
          await api.addApiRule(addApiRule);
        } catch (e) {
          logger.error(e);
          await interaction.editReply({
            content:
              "Could not create the rule for this server, please try again later.",
          });
          return;
        }

        // reply
        await interaction.editReply({
          content: "Rule added successfully!",
        });
        break;

      case "add-complex-rule":
        role = interaction.options.getRole("role", true);

        let allRules: GenericRule[];
        try {
          allRules = (await api.getRules(interaction.guildId)).rules;
        } catch (e) {
          logger.error(e);
          await interaction.editReply({
            content:
              "Could not get rules for this server, please try again later.",
          });
          return;
        }

        let expression: string | undefined = "";
        let mode: ComplexRuleMode = "&&";
        let phase: number = 0;
        let ruleIds: string[] = [];
        await interaction.editReply({
          embeds: [
            createComplexRuleEmbed({
              role,
              rules: allRules,
              selected: ruleIds,
              phase,
              expression: generateExpression(ruleIds, mode, expression),
            }),
          ],
          components: createComplexRuleButtons(phase, allRules, ruleIds),
        });

        const collector = interaction.channel?.createMessageComponentCollector({
          time: 150000,
          filter: (i) =>
            i.customId.startsWith("cr.") && i.user.id === interaction.user.id,
        });

        collector?.on("collect", async (collected) => {
          if (collected instanceof ButtonInteraction) {
            const action = collected.customId.split(".")[1];
            switch (action) {
              case "next":
                phase++;
                break;
              case "cancel":
                collector.stop("cancelled");
                return;
              case "finish":
                collector.stop();
                return;
              case "mode":
                const temp = collected.customId.split(".")[2];
                if (temp === "custom") {
                  await collected.showModal(
                    customExpressionModal(
                      generateExpression(ruleIds, mode, expression)
                    )
                  );
                  try {
                    const modal = await collected.awaitModalSubmit({
                      time: 150000,
                      filter: (i) =>
                        i.user.id === interaction.user.id &&
                        i.customId === "cr.expression",
                    });
                    mode = "custom";
                    expression = modal.fields.getTextInputValue("expression");
                    await modal.deferUpdate();
                  } catch (error) {
                    return;
                  }
                } else {
                  mode = temp === "or" ? "||" : "&&";
                  expression = undefined;
                  await collected.deferUpdate();
                }
                break;
            }
          } else {
            ruleIds = ruleIds
              .filter(
                (r) =>
                  !r
                    .toLocaleLowerCase()
                    .startsWith(
                      collected.customId.split(".")[2].toLocaleLowerCase()
                    )
              )
              .concat(collected.values);
            await collected.deferUpdate();
          }

          await interaction.editReply({
            embeds: [
              createComplexRuleEmbed({
                role,
                rules: allRules,
                selected: ruleIds,
                phase,
                expression: generateExpression(ruleIds, mode, expression),
              }),
            ],
            components: createComplexRuleButtons(
              phase,
              allRules,
              ruleIds,
              mode
            ),
          });
        }); // END COLLECTOR

        const reason = await new Promise((resolve) => {
          collector?.once("end", (_, reason) => resolve(reason));
        });

        if (reason === "time") {
          await interaction.editReply({
            content: "Complex rule creation timed out.",
            embeds: [],
            components: [],
          });
          return;
        } else if (reason === "cancelled") {
          await interaction.editReply({
            content: "Complex rule creation cancelled.",
            embeds: [],
            components: [],
          });
          return;
        }

        await interaction.editReply({
          content: "Creating complex rule...",
          components: [],
        });

        try {
          await api.addComplexRule({
            role: role.id,
            complexExpression: generateExpression(
              ruleIds,
              mode,
              expression
            ).replace(/ /g, ""),
            discordServerId: interaction.guildId,
          });
        } catch (error: any) {
          logger.error(error);
          await interaction.editReply({
            content:
              "Could not create the rule for this server, please try again later.",
          });
          return;
        }

        await interaction.editReply({
          content:
            "Complex rule added successfully! Please note that it might take some time for the role to be assigned to users.",
        });

        break;

      case "add-cross-chain-rule": {
        const collection = interaction.options.getInteger("collection", true);
        const role = interaction.options.getRole("role", true);
        const quantity = interaction.options.getInteger("quantity") ?? 1;

        const definedAbstractCollection =
          repository.definedAbstractCollections.find(
            (c) => c.id === collection
          );

        if (!definedAbstractCollection) {
          await interaction.editReply({
            content: "Collection not found.",
          });
          return;
        }

        await interaction.editReply({
          content: "Creating cross-chain rule...",
          embeds: [createCrossChainRuleEmbed(definedAbstractCollection)],
        });

        const promises = definedAbstractCollection.collections.map(
          async (c) => {
            try {
              return await api.addNftRule({
                nftAddress: c.address,
                tokenIds: [],
                quantity: 1,
                quantityOperatorName: "Greater Than Or Equals",
                blockchainName: c.blockchain.name,
                discordServerId: interaction.guildId!,
                discordChannelId:
                  typeof interaction.channel?.id! === "string"
                    ? interaction.channel?.id!
                    : "",
                discordMessageId: "",
                description: `Cross-chain rule for collection ${definedAbstractCollection.name}`,
              });
            } catch (e) {
              logger.error(e);
              return null;
            }
          }
        );

        const results = await Promise.all(promises);
        if (results.some((r) => r === null)) {
          await interaction.editReply({
            content:
              "Could not create the rule for this server, please try again later.",
          });
          return;
        }

        await interaction.editReply({
          embeds: [createCrossChainRuleEmbed(definedAbstractCollection, 1)],
        });

        const ruleIds = results.map((r) => `N-${r}`);
        const expression = ruleIds.join("||");

        try {
          await api.addComplexRule({
            complexExpression: expression,
            totalQuantityOverrideAndAssertIsORrule: quantity,
            discordServerId: interaction.guildId!,
            role: role.id,
            description: `Cross-chain rule for collection ${
              definedAbstractCollection.name
            } :: ${ruleIds.join(",")}`,
          });
        } catch (error) {
          logger.error(error);
          await interaction.editReply({
            content:
              "Could not create the rule for this server, please try again later.",
          });
        }

        await interaction.editReply({
          content: "Cross-chain rule added successfully!",
          embeds: [createCrossChainRuleEmbed(definedAbstractCollection, 3)],
        });
        break;
      }

      case "view-rules":
        let getRulesResponse;
        try {
          getRulesResponse = await api.getRules(interaction.guildId);
        } catch (e) {
          logger.error(e);
          await interaction.editReply({
            content:
              "Could not get rules for this server, please try again later.",
          });
          return;
        }
        const serverRules = getRulesResponse.rules;

        if (serverRules.length == 0) {
          await interaction.editReply({
            content:
              "You haven't created any rules yet. Please run `/lunar-configure add-nft-rule` and try again.",
          });
          return;
        }

        const res = serverRules.map((rule) => {
          let roleName = interaction.guild!.roles.cache.find(
            (role) => role.id == rule.role
          )?.name;

          return {
            ruleId: rule.id,
            nftAddress: rule.address,
            apiUrl: rule.apiUrl,
            quantity: rule.quantity,
            complexExpression: rule.complexExpression,
            role: roleName,
            tokenIds: rule.tokenIds,
            createdTimestamp: rule.createdAt,
            description: rule.description,
          };
        });

        // reply with list of configured rules
        await interaction.editReply({
          content: "Your configured rules are attached!",
          files: [
            new AttachmentBuilder(Buffer.from(JSON.stringify(res, null, 4)), {
              name: `lunar-assistant-rules.txt`,
            }),
          ],
        });
        break;

      case "remove-rule":
        ruleNumber = interaction.options
          .getString("rule-id", true)
          .toUpperCase();

        let rules: GenericRule[] = [];
        try {
          rules.push(...(await api.getRules(interaction.guildId)).rules);
        } catch (error) {
          logger.error(error);
        }
        const r = rules.find((r) => r.id === ruleNumber);
        let dependencies: GenericRule[] = [];
        if (
          ruleNumber.startsWith("C") &&
          r?.complexExpression &&
          r.description?.startsWith("Cross-chain rule") &&
          r.description?.includes("::")
        ) {
          r.complexExpression.match(RULE_ID_REGEX)?.forEach((d) => {
            const target = rules.find((r) => r.id === d);
            if (target && (target.role === undefined || target.role === "none"))
              dependencies.push(target);
          });
        }

        try {
          await api.deleteRule(interaction.guildId, ruleNumber);
        } catch (e) {
          logger.error(e);
          await interaction.editReply({
            content:
              "Could not delete the rule for this server, please try again later.",
          });
          return;
        }

        await Promise.all(
          dependencies.map(async (d) => {
            await api.deleteRule(interaction.guildId!, d.id);
          })
        );

        // reply
        await interaction.editReply({
          content: "Rule removed successfully!",
        });
        break;
    }
  },
  autocomplete: async (
    lunarAssistant: LunarAssistant,
    interaction: AutocompleteInteraction
  ) => {
    const focused = interaction.options.getFocused(true);
    switch (focused.name) {
      case "token-address":
      case "nft-address": {
        const blockchainName = interaction.options.getString(
          "blockchain",
          true
        );
        const tokenAddress = focused.value;

        const filtered = repository
          .getIndexCollectionByChain(blockchainName)
          .filter(
            (c) =>
              tokenAddress === "" ||
              c.address.toLowerCase().includes(tokenAddress.toLowerCase()) ||
              c.name.toLowerCase().includes(tokenAddress.toLowerCase())
          );

        const shuffledArray = shuffleArray(filtered).slice(0, 10);

        interaction.respond(
          shuffledArray.map((c) => ({
            name: `${c.name} - (${c.address.slice(0, 6)}...${c.address.slice(
              -4
            )})`,
            value: c.address,
          }))
        );
        break;
      }
      case "collection": {
        const collectionAddress = focused.value;

        const filtered = repository.definedAbstractCollections.filter(
          (c) =>
            collectionAddress === "" ||
            c.name.toLowerCase().includes(collectionAddress.toLowerCase()) ||
            c.collections.find(
              (col) =>
                col.address
                  .toLowerCase()
                  .includes(collectionAddress.toLowerCase()) ||
                col.name.toLowerCase().includes(collectionAddress.toLowerCase())
            )
        );

        const shuffledArray = shuffleArray(filtered).slice(0, 10);
        interaction.respond(
          shuffledArray.map((c) => ({
            name: `${c.name} - (${c.collections.length} collections)`,
            value: c.id,
          }))
        );
        break;
      }
      case "rule-id": {
        let getRulesResponse;
        try {
          getRulesResponse = await api.getRules(interaction.guildId!);
        } catch (e) {
          logger.error(e);
        }
        const serverRules = getRulesResponse?.rules ?? [];

        const ruleId = focused.value;

        interaction.respond(
          serverRules
            .filter(
              (r) =>
                ruleId === "" ||
                r.id.toLocaleLowerCase().includes(ruleId.toLocaleLowerCase())
            )
            .map((rule) => ({
              name: rule.id,
              value: rule.id,
            }))
            .slice(0, 24)
        );
      }
    }
  },
};

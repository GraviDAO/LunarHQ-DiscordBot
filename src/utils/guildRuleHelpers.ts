import {
  APIRule,
  CW20Rule,
  GuildRule,
  HumanAPIRule,
  HumanCW20Rule,
  HumanNFTRule,
  HumanSimpleRule,
  HumanStakedNFTRule,
  NFTRule,
  SimpleRule,
  StakedNFTRule,
} from "../shared/firestoreTypes";

// export const getGuildRuleType = (guildRule: GuildRule): GuildRuleType => {
//   if (Object.keys(guildRule.nft).length > 0) {
//     return "nft-rule";
//   } else if (Object.keys(guildRule.cw20).length > 0) {
//     return "cw20-rule";
//   } else {
//     throw new Error("Malformed GuildRule");
//   }
// };

export const isNFTRule = (simpleRule: SimpleRule) => {
  return "nftAddress" in simpleRule;
};

export const isCW20Rule = (simpleRule: SimpleRule) => {
  return "cw20Address" in simpleRule;
};

export const isStakedNFTRule = (simpleRule: SimpleRule) => {
  return "stakedNFTAddress" in simpleRule;
};

export const isApiRule = (simpleRule: SimpleRule) => {
  return "apiUrl" in simpleRule;
};

export const guildRuleToSimpleRule = (guildRule: GuildRule): SimpleRule => {
  if (Object.keys(guildRule.nft).length > 0) {
    // build the single NFT rule
    const nftAddresses = Object.keys(guildRule.nft);
    if (nftAddresses.length !== 1) throw new Error("Malformed GuildRule");
    const nftAddress = nftAddresses[0];
    const rule: NFTRule = {
      nftAddress,
      tokenIds: guildRule.nft[nftAddress].tokenIds,
      quantity: guildRule.nft[nftAddress].quantity,
      roleId: guildRule.roleId,
    };
    return rule;
  } else if (Object.keys(guildRule.stakedNFT).length > 0) {
    // build the single NFT rule
    const nftAddresses = Object.keys(guildRule.stakedNFT);
    if (nftAddresses.length !== 1) throw new Error("Malformed GuildRule");
    const stakedNFTAddress = nftAddresses[0];
    const rule: StakedNFTRule = {
      stakedNFTAddress,
      tokenIds: guildRule.stakedNFT[stakedNFTAddress].tokenIds,
      quantity: guildRule.stakedNFT[stakedNFTAddress].quantity,
      roleId: guildRule.roleId,
    };
    return rule;
  } else if (Object.keys(guildRule.cw20).length > 0) {
    // build the single cw20 rule
    const cw20Addresses = Object.keys(guildRule.cw20);
    if (cw20Addresses.length !== 1) throw new Error("Malformed GuildRule");
    const cw20Address = cw20Addresses[0];
    const rule: CW20Rule = {
      cw20Address: cw20Address,
      quantity: guildRule.cw20[cw20Address].quantity,
      roleId: guildRule.roleId,
    };
    return rule;
  } else if (Object.keys(guildRule.api).length > 0) {
    // build the single api rule
    const apiUrls = Object.keys(guildRule.api);
    if (apiUrls.length !== 1) throw new Error("Malformed GuildRule");
    const apiUrl = apiUrls[0];
    const rule: APIRule = {
      apiUrl: apiUrl,
      roleId: guildRule.roleId,
    };
    return rule;
  } else {
    throw new Error("Malformed GuildRule");
  }
};

export const simpleRuleToHumanSimpleRule = (
  simpleRule: SimpleRule,
  roleName: string
): HumanSimpleRule => {
  if (isNFTRule(simpleRule)) {
    let nftRule = simpleRule as NFTRule;
    let humanNftRule: HumanNFTRule = {
      nftAddress: nftRule.nftAddress,
      tokenIds: nftRule.tokenIds,
      quantity: nftRule.quantity,
      roleName: roleName,
    };
    return humanNftRule;
  } else if (isStakedNFTRule(simpleRule)) {
    let stakedNFTRule = simpleRule as StakedNFTRule;
    let humanStakedNftRule: HumanStakedNFTRule = {
      stakedNFTAddress: stakedNFTRule.stakedNFTAddress,
      tokenIds: stakedNFTRule.tokenIds,
      quantity: stakedNFTRule.quantity,
      roleName: roleName,
    };
    return humanStakedNftRule;
  } else if (isCW20Rule(simpleRule)) {
    let cw20Rule = simpleRule as CW20Rule;
    let humanCw20Rule: HumanCW20Rule = {
      cw20Address: cw20Rule.cw20Address,
      quantity: cw20Rule.quantity,
      roleName: roleName,
    };

    return humanCw20Rule;
  } else if (isApiRule(simpleRule)) {
    let apiRule = simpleRule as APIRule;
    let humanAPIRule: HumanAPIRule = {
      apiUrl: apiRule.apiUrl,
      roleName: roleName,
    };
    return humanAPIRule;
  } else {
    throw new Error("Malformed Simple Rule");
  }
};

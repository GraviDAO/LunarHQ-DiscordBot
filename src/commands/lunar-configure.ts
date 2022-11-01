import { SlashCommandBuilder } from "@discordjs/builders";
import {
  Attachment,
  AttachmentBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { LunarAssistant } from "..";
import {
  apiRuleData,
  nftRuleData,
  stakedNftRuleData,
  tokenRuleData,
} from "../shared/apiTypes";
import { isValidHttpUrl } from "../utils/helper";
import { api } from "../services/api";
import { isValidAddress } from "../utils/isValidAddress";
const logger = require('../logging/logger');

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
            .setName("nft-address")
            .setDescription(
              "The contract address against which to check for nft ownership for this rule."
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
              }
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
    )/* disabled for now until correctly implemented on backend with event based design
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
              }
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
          "Adds a rule for granting a role to users based on token ownership."
        )
        .addStringOption((option) =>
          option
            .setName("token-address")
            .setDescription(
              "The contract address against which to check for token ownership for this rule."
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
              }
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
              "The quantity of matching token tokens that a user must hold in order to meet the rule."
            )
        )
    )/*
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

    let nftAddress;
    let stakedNftAddress;
    let blockchainName;
    let role;
    let rawQuantity;
    let rawTokenIds;
    let tokenAddress;
    let apiUrl;
    let ruleNumber;
    let tokenIds;
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
        rawTokenIds = interaction.options.getString("token-ids");

        if (!isValidAddress(nftAddress, blockchainName)) {
          await interaction.editReply({
            content: "Invalid address",
          });
          return;
        }

        // verify that we can parse tokenIds
        try
        {
          if(rawTokenIds)
          {
            if(rawTokenIds.includes("[") || rawTokenIds.includes("]") || rawTokenIds.includes("'") || rawTokenIds.includes("\""))
            {
              throw new Error(`Invalid character in tokenIds`);
            }
            tokenIdArray = rawTokenIds.split(",").map(s => s.trim());
          }
        }
        catch
        {
          await interaction.editReply({
            content:
              'Could not parse token ids, please list token ids using a coma , to seperate values like so: 152, 19, 421',
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
          discordChannelId: typeof(interaction.channel?.id!) === "string"? interaction.channel?.id! : "",
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
          content: "Rule added successfully! Please note that it takes time for the system to index the collection if it is not already in the database. Expect about 1 hour per 10k tokens in the collection.",
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
        rawTokenIds = interaction.options.getString("token-ids");

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
        try
        {
          if(rawTokenIds)
          {
            if(rawTokenIds.includes("[") || rawTokenIds.includes("]") || rawTokenIds.includes("'") || rawTokenIds.includes("\""))
            {
              throw new Error(`Invalid character in tokenIds`);
            }
            tokenIdArray = rawTokenIds.split(",").map(s => s.trim());
          }
        }
        catch
        {
          await interaction.editReply({
            content:
              'Could not parse token ids, please list token ids using a coma , to seperate values like so: 152, 19, 421',
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

      case "view-rules":
        let getRulesResponse;
        try {
          getRulesResponse = await api.getNftRules(interaction.guildId);
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
            role: roleName,
            tokenIds: rule.tokenIds,
            createdTimestamp: rule.createdAt,
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
        ruleNumber = interaction.options.getString("rule-id", true);

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

        // reply
        await interaction.editReply({
          content: "Rule removed successfully!",
        });
        break;
    }
  },
};

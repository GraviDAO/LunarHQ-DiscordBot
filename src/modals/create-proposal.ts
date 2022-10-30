import { LunarAssistant } from "..";
import { primaryEmbed, proposalEmbed } from "../utils/embeds";
import {
  ComponentType,
  GuildPremiumTier,
  Message,
  ModalSubmitInteraction,
  TextChannel,
} from "discord.js";
import {
  blockchainNameChoices,
  castProposalVoteButtons,
} from "../utils/buttons";
import { timeToTimestamp } from "../utils/timeToTimestamp";
import { CreateProposal, Proposal } from "../shared/apiTypes";
import { api } from "../services/api";
import { timestampToDuration } from "../utils/timestampToDuration";
import { isValidAddress } from "../utils/isValidAddress";
const logger = require('../logging/logger');

export default {
  customId: "create-proposal",
  execute: async (
    lunarAssistant: LunarAssistant,
    interaction: ModalSubmitInteraction
  ) => {
    await interaction.reply({
      embeds: [primaryEmbed(undefined, "Creating proposal...")],
      ephemeral: true,
    });

    const quorum = parseFloat(
      interaction.fields.getTextInputValue("quorum") ?? 0
    );
    if (quorum < 0 || quorum > 100) {
      await interaction.editReply({
        content: "Invalid quorum value, must be between 0 and 100",
      });
      return;
    }

    let blockchainName: string | undefined;
    await interaction.editReply({
      embeds: [primaryEmbed("What blockchain is this proposal for? (more chains coming soon!)")],
      components: [blockchainNameChoices()],
    });
    
    let action;
    try {
      action = await interaction.channel?.awaitMessageComponent({
        componentType: ComponentType.SelectMenu,
        filter: (int) =>
          int.customId === "blockchainPicker" &&
          int.user.id === interaction.user.id,
        time: 60000,
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [
          primaryEmbed(undefined, "Timed out waiting for blockchain picker"),
        ],
      });
      return;
    } finally {
      blockchainName = action?.values.at(0);
    }

    const nftAddress = interaction.fields.getTextInputValue("nftAddress");
    if (!isValidAddress(nftAddress, blockchainName!)) {
      await interaction.editReply({
        content: "Invalid address",
      });
      return;
    }

    await action?.deferUpdate();

    if (!blockchainName) {
      await interaction.editReply({
        embeds: [primaryEmbed(undefined, "No blockchain selected")],
        components: [],
      });
      return;
    }

    let message: Message;
    try {
      message = await interaction.channel!.send({
        embeds: [primaryEmbed("Creating proposal...", undefined)],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [primaryEmbed(undefined, "Failed to create proposal.")],
        components: [],
      });
      return;
    }

    const data: CreateProposal = {
      title: interaction.fields.getTextInputValue("title"),
      description: interaction.fields.getTextInputValue("description"),
      address: nftAddress,
      creatorDiscordId: interaction.user.id,
      quorum: quorum.toString(),
      duration: timestampToDuration(
        timeToTimestamp(interaction.fields.getTextInputValue("time").length == 0? "14d": interaction.fields.getTextInputValue("time"))
      ),
      votingSystem: "Token Weighted Voting",
      discordServerId: interaction.guildId!,
      discordChannelId: interaction.channel!.id,
      discordMessageId: message.id,
      blockchainName: blockchainName,
    };

    let proposal: Proposal;
    try {
      proposal = await api.createProposal(data);
    } catch (error: any) {
      logger.error(error);

      await interaction.editReply({
        embeds: [primaryEmbed("Failed to create proposal", error.message.data)],
        components: [],
      });
      await message.delete();
      return;
    }

    try {
      await message.edit({
        embeds: [proposalEmbed(proposal, interaction.user)],
        components: [castProposalVoteButtons()],
      });
    } catch (error) {
      await interaction.editReply({
        embeds: [primaryEmbed("Failed to create proposal", undefined)],
        components: [],
      });
      return;
    }

    if (message.channel instanceof TextChannel) {
      try {
        await message.channel.threads.create({
          startMessage: message.id,
          name: `Discussion - ${data.title}`,
          autoArchiveDuration:
            message.guild!.premiumTier === GuildPremiumTier.None ? 1440 : 4320,
        });
      } catch (error) {
        await interaction.followUp({
          embeds: [
            primaryEmbed(
              "Could not create a thread",
              "Please make sure I have permission to create threads."
            ),
          ],
        });
      }
    }

    await interaction.editReply({
      embeds: [primaryEmbed(undefined, "Proposal Successfully Created! Please note that it takes time for the system to index the collection if it is not already in the database. Expect about 1 hour per 10k tokens in the collection.")],
    });
  },
};

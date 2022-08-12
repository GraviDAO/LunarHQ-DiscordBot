import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { Message, MessageContextMenuCommandInteraction } from "discord.js";
import { LunarAssistant } from "..";
import { primaryEmbed, proposalResultsEmbed } from "../utils/embeds";
import { api } from "../services/api";
import { castProposalVoteButtons } from "../utils/buttons";
import { GetProposalResultsResponse } from "../shared/apiTypes";
const logger = require('../logging/logger');

export default {
  data: new ContextMenuCommandBuilder()
    .setName("View Poll Results")
    .setDefaultPermission(false)
    .setType(3),
  execute: async (
    lunarAssistant: LunarAssistant,
    interaction: MessageContextMenuCommandInteraction
  ) => {
    const message = interaction.targetMessage;

    if (message.author.id !== lunarAssistant.client.user?.id) {
      await interaction.reply({
        embeds: [primaryEmbed(undefined, "Invalid proposal message.")],
        ephemeral: true,
      });
      return;
    }

    let proposals;
    try {
      proposals = await api.getProposals(interaction.guildId!);
    } catch (error) {
      logger.error(error);
      await interaction.reply({
        embeds: [primaryEmbed(undefined, "Could not get proposals.")],
        ephemeral: true,
      });
      return;
    }

    const proposal = proposals.proposals.find(
      (v) => v.discordMessageId === message.id
    );

    if (!proposal) {
      await interaction.reply({
        embeds: [primaryEmbed(undefined, "Invalid proposal message.")],
        ephemeral: true,
      });
      return;
    }

    let results: GetProposalResultsResponse;
    try {
      results = await api.getProposalResults(
        interaction.guildId!,
        proposal.id.toString(),
        interaction.targetMessage.id
      );
    } catch (error) {
      logger.error(error);
      await interaction.reply({
        embeds: [primaryEmbed(undefined, "Could not get proposal results.")],
        ephemeral: true,
      });
      return;
    }

    if (message instanceof Message) {
      await message.edit({ components: [castProposalVoteButtons(false)] });
      await message.reply({
        embeds: [proposalResultsEmbed(proposal, results.choices)],
      });
    } else {
      await interaction.channel?.send({
        embeds: [proposalResultsEmbed(proposal, results.choices)],
      });
    }

    await interaction.reply({
      embeds: [primaryEmbed(undefined, "Sent the results of the proposal.")],
      ephemeral: true,
    });
  },
};

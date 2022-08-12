import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { MessageContextMenuCommandInteraction } from "discord.js";
import { LunarAssistant } from "..";
import { api } from "../services/api";
import { GetProposalResultsResponse } from "../shared/apiTypes";
import { primaryEmbed, proposalResultsEmbed } from "../utils/embeds";
const logger = require('../logging/logger');

export default {
  data: new ContextMenuCommandBuilder()
    .setName("Delete Poll")
    .setDefaultPermission(false)
    .setType(3),
  execute: async (
    lunarAssistant: LunarAssistant,
    interaction: MessageContextMenuCommandInteraction
  ) => {
    const message = interaction.targetMessage;

    if (message.author.id !== lunarAssistant.client.user?.id) {
      await interaction.reply({
        embeds: [primaryEmbed(undefined, "Invalid poll message.")],
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

    if (proposal.status.toLowerCase() === "active") {
      await interaction.reply({
        embeds: [
          primaryEmbed(
            undefined,
            "This poll is still open, you need to close it before deleting it."
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    let results: GetProposalResultsResponse | undefined;
    try {
      results = await api.getProposalResults(
        interaction.guildId!,
        proposal.id.toString(),
        interaction.targetMessage.id
      );
    } catch (error) {
      logger.error(error);
    }

    try {
      await api.deleteProposal(interaction.guildId!, proposal.id.toString());
    } catch (error) {
      logger.error(error);
      await interaction.reply({
        embeds: [primaryEmbed(undefined, "Could not delete proposal.")],
        ephemeral: true,
      });
      return;
    }

    const embeds = [primaryEmbed(undefined, "The proposal has been deleted.")];

    if (results) embeds.push(proposalResultsEmbed(proposal, results.choices));

    await interaction.reply({ embeds: embeds, ephemeral: true });
  },
};

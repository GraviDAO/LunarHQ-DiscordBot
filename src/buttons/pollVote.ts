import { ButtonInteraction } from "discord.js";
import { LunarAssistant } from "..";
import { api } from "../services/api";
import { primaryEmbed } from "../utils/embeds";

export default {
  customId: "proposalVote",
  execute: async (
    lunarAssistant: LunarAssistant,
    interaction: ButtonInteraction
  ) => {
    await interaction.deferReply({ ephemeral: true });
    const vote = interaction.customId.split(".")[1];

    try {
      await api.castVote(
        interaction.guildId!,
        vote,
        interaction.user.id,
        interaction.message.id
      );
      await interaction.reply({
        embeds: [primaryEmbed(undefined, `You have voted as ${vote}!`)],
      });
    } catch (error) {
      console.log(error);
      await interaction.reply({
        embeds: [
          primaryEmbed(undefined, "Could not cast vote. Please try again."),
        ],
        ephemeral: true,
      });
      return;
    }
  },
};

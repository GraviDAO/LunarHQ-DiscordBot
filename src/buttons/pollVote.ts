import { ButtonInteraction } from "discord.js";
import { LunarAssistant } from "..";
import { api } from "../services/api";
import { primaryEmbed } from "../utils/embeds";
import { toCamelCase, toPascalCase } from "../utils/helper";

export default {
  customId: "proposalVote",
  execute: async (
    lunarAssistant: LunarAssistant,
    interaction: ButtonInteraction
  ) => {
    await interaction.deferReply({ ephemeral: true });
    const vote = interaction.customId.split(".")[1];
    console.log(toPascalCase(vote));

    try {
      await api.castVote(
        interaction.guildId!,
        toPascalCase(vote),
        interaction.user.id,
        interaction.message.id
      );
      await interaction.editReply({
        embeds: [primaryEmbed(undefined, `You have voted as ${vote}!`)],
      });
    } catch (error) {
      console.log(error);
      await interaction.editReply({
        embeds: [
          primaryEmbed(undefined, "Could not cast vote. Please try again."),
        ],
      });
      return;
    }
  },
};

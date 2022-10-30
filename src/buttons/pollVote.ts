import { ButtonInteraction } from "discord.js";
import { LunarAssistant } from "..";
import { api } from "../services/api";
import { primaryEmbed } from "../utils/embeds";
import { toCamelCase, toPascalCase } from "../utils/helper";
const logger = require('../logging/logger');

export default {
  customId: "proposalVote",
  execute: async (
    lunarAssistant: LunarAssistant,
    interaction: ButtonInteraction
  ) => {
    await interaction.deferReply({ ephemeral: true });
    const vote = interaction.customId.split(".")[1];
    logger.info(toPascalCase(vote));

    try {
      const returnMessage = await api.castVote(
        interaction.guildId!,
        toPascalCase(vote),
        interaction.user.id,
        interaction.message.id
      );
      await interaction.editReply({
        embeds: [primaryEmbed(undefined, `${returnMessage.message}. Final weight calculation will be done when the poll closes.`)],
      });
    } catch (error) {
      logger.error(error);
      if(error instanceof Error && error.message.includes("403")) {
        await interaction.editReply({
          embeds: [
            primaryEmbed(undefined, "You own no amount of the required asset."),
          ],
        });
      } else {
        await interaction.editReply({
          embeds: [
            primaryEmbed(undefined, "Could not cast vote. Please try again."),
          ],
        });
      }
      return;
    }
  },
};

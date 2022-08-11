import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { LunarAssistant } from "..";
import { WEBAPP_URL } from "../../config.json";

export default {
  data: new SlashCommandBuilder()
    .setName("lunar-link")
    .setDescription("Links a wallet to your discord account."),
  execute: async (
    lunarAssistant: LunarAssistant,
    interaction: ChatInputCommandInteraction
  ) => {
    // verify the interaction is valid

    await interaction.reply({
      content: `Greetings from the Lunar Assistant! Please click [here](${WEBAPP_URL}) to link your wallets with your discord account.`,
      ephemeral: true,
    });
  },
};

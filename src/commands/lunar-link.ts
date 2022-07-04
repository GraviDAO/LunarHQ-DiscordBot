import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import jwt from "jsonwebtoken";
import { LunarAssistant } from "..";
import { DISCORD_VERIFICATION_SECRET, environment } from "../../config.json";

export default {
  data: new SlashCommandBuilder()
    .setName("lunar-link")
    .setDescription("Links a wallet to your discord account."),
  execute: async (
    lunarAssistant: LunarAssistant,
    interaction: CommandInteraction
  ) => {
    // verify the interaction is valid

    const token = jwt.sign(
      { userID: interaction.user.id },
      DISCORD_VERIFICATION_SECRET,
      { expiresIn: "1h" }
    );
    const url =
      (environment === "production"
        ? "https://lunarassistant.com/"
        : "http://localhost:3000/") + token;

    await interaction.reply({
      content: `Greetings from the Lunar Assistant! Please click [here](${url}) to link your terra wallet with your discord account.`,
      ephemeral: true,
    });
  },
};

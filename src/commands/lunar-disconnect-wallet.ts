import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { LunarAssistant } from "..";
import { api } from "../services/api";
import { AccountWallet } from "../shared/apiTypes";

export default {
  data: new SlashCommandBuilder()
    .setName("lunar-disconnect-wallet")
    .setDescription("Disconnect the wallet linked to your discord account."),
  execute: async (
    lunarAssistant: LunarAssistant,
    interaction: ChatInputCommandInteraction
  ) => {
    await interaction.deferReply({ ephemeral: true });

    let wallets: AccountWallet[];
    try {
      wallets = (await api.getUsersWallets(interaction.user.id)).accountWallets;
    } catch (e) {
      await interaction.editReply({
        content: "Error getting your wallets, please try again later.",
      });
      return;
    }

    if (wallets.length === 0) {
      await interaction.editReply({
        content:
          "You haven't linked a wallet yet, so there is no wallet to disconnect.",
      });
      return;
    }

    try {
      await api.unlinkWallet(interaction.user.id);
      await interaction.editReply({
        content: "Your wallet has been disconnected.",
      });
    } catch (error) {
      console.log(error);
      await interaction.editReply({
        content: "Error disconnecting your wallet, please try again later.",
      });
      return;
    }
  },
};

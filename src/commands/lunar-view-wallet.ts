import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { LunarAssistant } from "..";
import { api } from "../services/api";
import { AccountWallet } from "../shared/apiTypes";

export default {
  data: new SlashCommandBuilder()
    .setName("lunar-view-wallet")
    .setDescription("View the wallet linked to your discord account."),
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
          "You haven't linked any wallets yet. Link a wallet with `/lunar-link`.",
      });
      return;
    }

    await interaction.editReply({
      content: `Your wallet${wallets.length > 1 ? "s are" : " is"}: ${wallets
        .map((v: AccountWallet) => v.address)
        .join(", ")}`,
    });
  },
};

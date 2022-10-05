import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { LunarAssistant } from "..";
import { api } from "../services/api";
import { AccountWallet } from "../shared/apiTypes";
const logger = require('../logging/logger');

export default {
  data: new SlashCommandBuilder()
    .setName("lunar-disconnect-wallet")
    .setDescription("Disconnect a wallet linked to your discord account.")
    .addStringOption((option) =>
          option
            .setName("wallet-address")
            .setDescription(
              "The wallet address to unlink from your account"
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("blockchain")
            .setDescription(
              "The blockchain name to which the nft-address belongs."
            )
            .setRequired(true)
            .addChoices(
              {
                value: "Terra",
                name: "Terra",
              },
              {
                value: "Terra Classic",
                name: "Terra Classic",
              },
              {
                value: "polygon-mainnet",
                name: "Polygon",
              }
            )
        ),
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
      const nftAddress = interaction.options
        .getString("wallet-address", true)
        .toLowerCase();
      const blockchainName = interaction.options.getString("blockchain", true);
      await api.unlinkWallet(interaction.user.id, nftAddress, blockchainName);
      await interaction.editReply({
        content: "Your wallet has been disconnected.",
      });
    } catch (error) {
      logger.error(error);
      await interaction.editReply({
        content: "Error disconnecting your wallet, please try again later.",
      });
      return;
    }
  },
};

import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { LunarAssistant } from "..";
import { proposalCreateModal } from "../utils/modals";
import { proposalsEmbed } from "../utils/embeds";
import { api } from "../services/api";
import { GetProposalsResponse } from "../shared/apiTypes";

export default {
  data: new SlashCommandBuilder()
    .setName("lunar-poll")
    .setDescription("Manage off-chain polls on your discord.")
    .addSubcommand((command) =>
      command.setName("create").setDescription("Create a Poll.")
    )
    .addSubcommand((command) =>
      command
        .setName("list")
        .setDescription("Shows a list of all polls.")
        .addStringOption((option) =>
          option
            .setName("status")
            .setDescription("Filter polls by their statuses.")
            .addChoices(
              {
                name: "All Polls",
                value: "all",
              },
              {
                name: "Finished Polls",
                value: "closed",
              },
              {
                name: "Open Polls",
                value: "open",
              }
            )
        )
    ),
  execute: async (
    lunarAssistant: LunarAssistant,
    interaction: ChatInputCommandInteraction
  ) => {
    // verify the interaction is valid
    if (!interaction.guildId || !interaction.guild || !interaction.member)
      return;

    const subcommand = interaction.options.getSubcommand(true);

    if (subcommand === "create") {
      interaction.showModal(proposalCreateModal());
    }
    if (subcommand === "list") {
      const status = interaction.options.getString("status") ?? "all";

      let getProposalsResponse: GetProposalsResponse;
      try {
        getProposalsResponse = await api.getProposals(interaction.guildId);
      } catch (e) {
        console.error(e);
        await interaction.editReply({
          content:
            "Could not get rules for this server, please try again later.",
        });
        return;
      }

      await interaction.reply({
        embeds: [proposalsEmbed(getProposalsResponse.proposals)],
        ephemeral: true,
      });
    }
  },
};

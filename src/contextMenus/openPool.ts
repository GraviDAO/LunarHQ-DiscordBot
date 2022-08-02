import { ContextMenuCommandBuilder } from "@discordjs/builders";
import { Message, MessageContextMenuCommandInteraction } from "discord.js";
import { LunarAssistant } from "..";
import { api } from "../services/api";
import { castProposalVoteButtons } from "../utils/buttons";
import { primaryEmbed } from "../utils/embeds";

export default {
  data: new ContextMenuCommandBuilder()
    .setName("Open Poll")
    .setDefaultPermission(false)
    .setType(3),
  execute: async (
    lunarAssistant: LunarAssistant,
    interaction: MessageContextMenuCommandInteraction
  ) => {
    const message = interaction.targetMessage;

    if (message.author.id !== lunarAssistant.client.user?.id) {
      await interaction.reply({
        embeds: [primaryEmbed(undefined, "Invalid proposal message.")],
        ephemeral: true,
      });
      return;
    }

    let proposals;
    try {
      proposals = await api.getProposals(interaction.guildId!);
    } catch (error) {
      console.log(error);
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

    try {
      await api.closeProposal(interaction.guildId!, proposal.id.toString());
    } catch (error) {
      console.log(error);
      await interaction.reply({
        embeds: [primaryEmbed(undefined, "Could not open proposal.")],
        ephemeral: true,
      });
      return;
    } finally {
      if (message instanceof Message) {
        await message.edit({ components: [castProposalVoteButtons(false)] });
        if (message.thread && !message.thread.archived) {
          try {
            await message.thread.setArchived(false, "Poll Opened");
          } catch (error) {
            console.log(`Could not archive thread: ${message.thread.name}`);
          }
        }
      }

      await interaction.reply({
        embeds: [primaryEmbed(undefined, "Opened the poll to votes.")],
        ephemeral: true,
      });
    }
  },
};

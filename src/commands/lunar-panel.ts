import { SlashCommandBuilder } from "@discordjs/builders";
import {
  channelMention,
  ChannelType,
  ChatInputCommandInteraction,
  GuildTextBasedChannel,
} from "discord.js";
import { LunarAssistant } from "..";
import { lunarAssistantPanelButtons } from "../utils/buttons";
import { lunarAssistantPanelEmbed } from "../utils/embeds";

export default {
  data: new SlashCommandBuilder()
    .setName("lunar-panel")
    .setDescription("Send the lunar assistant panel")
    .setDefaultPermission(false)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription(
          "The channel to send the panel to (defaults to current channel)"
        )
        .setRequired(false)
        .addChannelTypes(0) //ChannelType.GuildText
    ),
  execute: async (
    lunarAssistant: LunarAssistant,
    interaction: ChatInputCommandInteraction
  ) => {
    // verify the interaction is valid
    if (!interaction.guildId || !interaction.guild || !interaction.member)
      return;

    const optionChannel = (interaction.options.getChannel("channel") ??
      interaction.channel!) as GuildTextBasedChannel;

    await interaction.deferReply({ ephemeral: true });

    try {
      await optionChannel.send({
        embeds: [lunarAssistantPanelEmbed()],
        components: [lunarAssistantPanelButtons()],
      });
    } catch (error) {
      console.log(error);

      await interaction.editReply({
        content: `There was an error sending the panel to ${channelMention(
          optionChannel.id
        )}, please make sure I have permissions to send messages there.`,
      });
      return;
    }

    await interaction.editReply({
      content: `The panel has been sent to ${channelMention(
        optionChannel.id
      )}.`,
    });
  },
};

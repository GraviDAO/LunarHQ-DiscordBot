import {
  BaseGuildTextChannel,
  Guild,
  GuildBasedChannel,
  GuildChannel,
  Message,
} from "discord.js";
import { LunarAssistant } from "..";
import { Proposal } from "../shared/apiTypes";
import { archiveProposal } from "./archiveProposal";

export const setupPollTimeout = async (
  lunarAssistant: LunarAssistant,
  guild: Guild,
  polls: Proposal[]
) => {
  const now = Date.now();

  for (const p of polls) {
    let channel: GuildBasedChannel | null;

    try {
      channel =
        guild.channels.cache.get(p.discordChannelId!) ??
        (await guild.channels.fetch(p.discordChannelId!));
      if (!channel || !(channel instanceof BaseGuildTextChannel)) continue;
    } catch (e) {
      console.log(e);
      continue;
    }

    let message: Message;
    try {
      message =
        channel.messages.cache.get(p.discordMessageId!) ??
        (await channel.messages.fetch(p.discordMessageId!));
      if (!message) continue;
    } catch (error) {
      continue;
    }

    // if (p.startDate < now) {
    //   archiveProposal(lunarAssistant, message, p);
    // } else {
    //   setTimeout(() => {
    //     archiveProposal(lunarAssistant, message, p);
    //   }, p.endsAt - now);
    // }

    await new Promise((r) => setTimeout(r, 1000));
  }
};

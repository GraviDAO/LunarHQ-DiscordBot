import { lunarHQ_url } from "../../config.json";

import { readFileSync } from "fs";
import { io } from "socket.io-client";
import { archiveProposal } from "../utils/archiveProposal";
import { BaseGuildTextChannel, Guild, GuildBasedChannel, GuildMember, GuildPremiumTier, Message, TextChannel } from "discord.js";
import { Proposal } from "../shared/apiTypes";
import { LunarAssistant } from "..";
import { primaryEmbed, proposalEmbed } from "../utils/embeds";
import { castProposalVoteButtons } from "../utils/buttons";
import { api } from "../services/api";
const logger = require('../logging/logger');

/*
example1:
const socket = io('https://server.aaa.com:8443', {
    hostname: 'server.aaa.com',
    transports: ['websocket'],
    key: fs.readFileSync('../certs/client-key.pem'),
    cert: fs.readFileSync('../certs/client-crt.pem'),
    ca: [
      fs.readFileSync('../certs/server-ca-crt.pem')
    ],
    rejectUnauthorized: false,
    reconnection: false
});

example2:
const socket = io("https://example.com", {
  key: readFileSync("/path/to/client-key.pem"),
  cert: readFileSync("/path/to/client-cert.pem"),
  ca: [
    readFileSync("/path/to/server-cert.pem")
  ]
});
*/
const socket = io("http://localhost:6060");

export default socket;

export async function StartListener(lunarAssistant: LunarAssistant) {

    socket.on("connect", () => {
        logger.info(`connected with socketId: ${socket.id}`); 
    });
  
    socket.on("disconnect", () => {
        logger.info("Socket disconnected"); 
    });
    
    socket.on("proposalEnded", async (proposal: Proposal, callback) => {
        logger.info(`Received proposalEnded event with args: ${JSON.stringify(proposal)}`);

        let guild: Guild;
        try {
          guild =
          lunarAssistant.client.guilds.cache.get(proposal.discordServerId) ??
            (await lunarAssistant.client.guilds.fetch(proposal.discordServerId));
          if (!guild) return;
        } catch (e) {
            return;
        }

        let channel: GuildBasedChannel | null;
        try {
          channel =
            guild.channels.cache.get(proposal.discordChannelId!) ??
            (await guild.channels.fetch(proposal.discordChannelId!));
          if (!channel || !(channel instanceof BaseGuildTextChannel)) return;
        } catch (e) {
          logger.error(e);
          return;
        }

        let message: Message;
        try {
          message =
            channel.messages.cache.get(proposal.discordMessageId!) ??
            (await channel.messages.fetch(proposal.discordMessageId!));
          if (!message) return;
        } catch (error) {
            return;
        }

        archiveProposal(message, proposal);

        callback("ok");
    });

    socket.on("proposalStarted", async (proposal: Proposal, callback) => {
      logger.info(`Received proposalStarted event with args: ${JSON.stringify(proposal)}`);

      let guild: Guild;
      try {
        guild =
        lunarAssistant.client.guilds.cache.get(proposal.discordServerId) ??
          (await lunarAssistant.client.guilds.fetch(proposal.discordServerId));
        if (!guild) return;
      } catch (e) {
          return;
      }

      let channel: GuildBasedChannel | null;
        try {
          channel =
            guild.channels.cache.get(proposal.discordChannelId!) ??
            (await guild.channels.fetch(proposal.discordChannelId!));
          if (!channel || !(channel instanceof BaseGuildTextChannel)) return;
        } catch (e) {
          logger.error(e);
          return;
        }

        let member: GuildMember | null;
        try {
          member =
            guild.members.cache.get(proposal.creatorDiscordId!) ??
            (await guild.members.fetch(proposal.creatorDiscordId!));
          if (!member) return;
        } catch (e) {
          logger.error(e);
          return;
        }

      let message: Message;
      try {
        message = await channel.send({
          embeds: [proposalEmbed(proposal, member.user)],
          components: [castProposalVoteButtons()],
        });
      } catch (error) {
        logger.error(`proposalStarted: Failed to create proposal embed for proposalId: ${proposal.id}.`);
        return;
      }
      
      if (message.channel instanceof TextChannel) {
        try {
          await message.channel.threads.create({
            startMessage: message.id,
            name: `Discussion - ${proposal.title}`,
            autoArchiveDuration:
              message.guild!.premiumTier === GuildPremiumTier.None ? 1440 : 4320,
          });
        } catch (error) {
          await message.reply({
            embeds: [
              primaryEmbed(
                "Could not create a thread",
                "Please make sure I have permission to create threads."
              ),
            ],
          });
        }
      }

      if(!proposal.discordMessageId) {
        try {
          await api.createProposalAddMsgId(proposal.discordServerId, { proposalId: proposal.id, discordMessageId: message.id });
        } catch(error) {
          logger.error(`proposalStarted: Failed to add messageId for existing proposal: ${proposal.id}.`);
        }
      }

      callback("ok");
  });

    socket.connect();
}
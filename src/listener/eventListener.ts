import { lunarHQ_url } from "../../config.json";

import { readFileSync } from "fs";
import { io } from "socket.io-client";
import { archiveProposal } from "../utils/archiveProposal";
import { BaseGuildTextChannel, Guild, GuildBasedChannel, Message } from "discord.js";
import { Proposal } from "../shared/apiTypes";
import { LunarAssistant } from "..";

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

const logger = require('../logging/logger');

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
          console.log(e);
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

    socket.connect();
}
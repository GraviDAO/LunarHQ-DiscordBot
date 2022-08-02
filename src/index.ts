import { Client, Guild, IntentsBitField } from "discord.js";
import { handle_interactions, token } from "../config.json";
import { interactionHandler } from "./utils/interactionHandler";
import { registerCommands } from "./utils/registerCommands";
import { setupPollTimeout } from "./utils/setupPollTimeout";
import { api } from "./services/api";

export class LunarAssistant {
  client: Client;

  // define functions
  public interactionHandler = interactionHandler;

  constructor() {
    // Create a new client instance
    this.client = new Client({ intents: [IntentsBitField.Flags.Guilds] });
  }

  async registerGuildCommands() {
    try {
      await registerCommands();
    } catch (e) {
      console.error(
        `Couldn't register commands due to the following error: ${e}`
      );
    }
  }

  // async startPollTimeouts() {
  //   const guildPolls = await db.collection("guildPolls").get();

  //   for (const guildPoll of guildPolls.docs) {
  //     let guild: Guild;
  //     const polls = ((guildPoll.data() as GuildPolls).polls ?? []).filter(
  //       (p: Poll) => p.active
  //     );
  //     try {
  //       guild =
  //         this.client.guilds.cache.get(guildPoll.id) ??
  //         (await this.client.guilds.fetch(guildPoll.id));
  //       if (!guild) continue;
  //     } catch (e) {
  //       continue;
  //     }
  //     try {
  //       await setupPollTimeout(this, guild, polls);
  //     } catch (e) {
  //       console.error(
  //         `Couldn't create poll timeouts commands for ${guild.name}`
  //       );
  //       console.error(e);
  //     }

  //     await new Promise((r) => setTimeout(r, 1000));
  //   }
  // }

  start(
    onReady: (lunarAssistantBot: LunarAssistant) => void,
    handleInteractions: boolean
  ) {
    // Setup listeners

    // When the client is ready, run this code (only once)
    this.client.once("ready", async () => {
      // Reregister guild commands for all servers
      this.registerGuildCommands();

      // this.startPollTimeouts();

      // Call the passed onReady function
      onReady(this);
    });

    if (handleInteractions) {
      // When the bot is added to a server, configure the slash commands
      this.client.on("guildCreate", registerCommands);

      // Handle slash command interactions
      this.client.on("interactionCreate", (interaction) =>
        this.interactionHandler(interaction)
      );
    }

    this.client.on("rateLimit", (data) => {
      console.log("Getting rate limited.");
      console.log(JSON.stringify(data));
    });

    // start the discord bot
    this.client.login(token);
  }
}

// create lunar assistant bot
const lunarAssistantBot = new LunarAssistant();

// start the lunar assistant bot
lunarAssistantBot.start(
  () => {
    console.log("Ready!");
  },
  handle_interactions
);

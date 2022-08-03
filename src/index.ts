import { Client, IntentsBitField } from "discord.js";
import { handle_interactions, token } from "../config.json";
import { interactionHandler } from "./utils/interactionHandler";
import { registerCommands } from "./utils/registerCommands";
import { StartListener } from "./listener/eventListener";

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

  start(
    onReady: (lunarAssistantBot: LunarAssistant) => void,
    handleInteractions: boolean
  ) {
    // Setup listeners

    // When the client is ready, run this code (only once)
    this.client.once("ready", async () => {
      // Reregister guild commands for all servers
      this.registerGuildCommands();

      StartListener(this);

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
lunarAssistantBot.start(() => {
  console.log("Ready!");
}, handle_interactions);

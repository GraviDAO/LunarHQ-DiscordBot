import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import path from "path";
import { clientId, token } from "../../config.json";
import { commandFiles } from "./commandFiles";
import { contextMenuFiles } from "./contextMenuFiles";
const logger = require('../logging/logger');

export const registerCommands = async () => {
  // get the list of new commands
  const newCommands = commandFiles.map((file) => {
    const commandFilePath = path.resolve(__dirname, `../commands/${file}`);
    const command = require(commandFilePath).default;
    return command.data.toJSON();
  });

  const newContextMenus = contextMenuFiles.map((file) => {
    const contextMenuFilePath = path.resolve(
      __dirname,
      `../contextMenus/${file}`
    );
    const contextMenu = require(contextMenuFilePath).default;
    return contextMenu.data.toJSON();
  });

  try
  {
    const rest = new REST({ version: "9" }).setToken(token);
    const commands = newCommands.concat(newContextMenus);
    // register the commands
    const result = await rest.put(Routes.applicationCommands(clientId) as any, {
      body: commands,
    });
    logger.info(`Successfully registered application commands`);//: ${JSON.stringify(result)}`);
  }
  catch(error)
  {
    logger.error(`Error: ${error} while registering commands`);
  }
  
};

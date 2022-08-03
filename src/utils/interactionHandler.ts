import {
  Collection,
  Interaction,
  InteractionType,
  ModalSubmitInteraction,
} from "discord.js";
import path from "path";
import { LunarAssistant } from "..";
import {
  ButtonData,
  ContextMenuData,
  ModalData,
  SlashCommandData,
} from "../types";
import { commandFiles } from "./commandFiles";
import { buttonFiles } from "./buttonFiles";
import { contextMenuFiles } from "./contextMenuFiles";
import { modalFiles } from "./modalFiles";

// Create a collection for the command handles
const commandHandlers = new Collection<string, SlashCommandData>();
// Create a collection for the command handles
const buttonHandlers = new Collection<string, ButtonData>();
// Create a collection for the user context menus handles
const contextMenusHandlers = new Collection<string, ContextMenuData>();
// Create a collection for the modal handles
const modalHandlers = new Collection<string, ModalData>();

// Populate the command handlers collection
for (const file of commandFiles) {
  const commandFilePath = path.resolve(__dirname, `../commands/${file}`);
  const command = require(commandFilePath).default;

  // Set a new item in the Collection
  // With the key as the command name and the value as the exported module
  commandHandlers.set(command.data.name, command);
}

// Populate the button handlers collection
for (const file of buttonFiles) {
  const buttonFilePath = path.resolve(__dirname, `../buttons/${file}`);
  const button = require(buttonFilePath).default;

  // Set a new item in the Collection
  // With the key as the button name and the value as the exported module
  buttonHandlers.set(button.customId, button);
}

// Populate the context menus handlers collection
for (const file of contextMenuFiles) {
  const contextMenuFilePath = path.resolve(
    __dirname,
    `../contextMenus/${file}`
  );
  const contextMenu = require(contextMenuFilePath).default;

  // Set a new item in the Collection
  // With the key as the button name and the value as the exported module
  contextMenusHandlers.set(contextMenu.data.name, contextMenu);
}

// Populate the modal handlers collection
for (const file of modalFiles) {
  const modalFilePath = path.resolve(__dirname, `../modals/${file}`);
  const modal = require(modalFilePath).default;

  // Set a new item in the Collection
  // With the key as the modal name and the value as the exported module
  modalHandlers.set(modal.customId, modal);
}

export async function interactionHandler(
  this: LunarAssistant,
  interaction: Interaction
) {
  if (
    ![InteractionType.ApplicationCommand, InteractionType.ModalSubmit, InteractionType.MessageComponent].includes(
      interaction.type
    )
  )
    return;

  if (interaction.isChatInputCommand()) {
    // get the command handler
    const command = commandHandlers.get(interaction.commandName);

    if (!command) return;

    // try to run the command handler
    try {
      await command.execute(this, interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({
          content: "There was an error while executing this command!",
        });
      }
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
  if (interaction.isButton()) {
    // get the button handler
    const button = buttonHandlers.get(interaction.customId.split(".")[0]);

    if (!button) return;

    // try to run the button handler
    try {
      await button.execute(this, interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({
          content: "There was an error while executing this command!",
        });
      }
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
  if (interaction.isMessageContextMenuCommand()) {
    // get the button handler
    const contextMenu = contextMenusHandlers.get(interaction.commandName);

    if (!contextMenu) return;

    // try to run the button handler
    try {
      await contextMenu.execute(this, interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({
          content: "There was an error while executing this command!",
        });
      }
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
  if (interaction instanceof ModalSubmitInteraction) {
    // get the modal handler
    const modal = modalHandlers.get(interaction.customId.split(".")[0]);

    if (!modal) return;

    // try to run the modal handler
    try {
      await modal.execute(this, interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply({
          content: "There was an error while executing this command!",
        });
      }
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
}

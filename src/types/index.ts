import {
  ContextMenuCommandBuilder,
  SlashCommandBuilder,
} from "@discordjs/builders";
import {
  AutocompleteInteraction,
  ButtonInteraction,
  CommandInteraction,
  ContextMenuCommandInteraction,
  ModalSubmitInteraction,
} from "discord.js";
import { LunarAssistant } from "..";

export interface SlashCommandData {
  data: SlashCommandBuilder;
  execute: (
    lunarAssistant: LunarAssistant,
    interaction: CommandInteraction
  ) => Promise<void>;
  autocomplete?: (
    lunarAssistant: LunarAssistant,
    interaction: AutocompleteInteraction
  ) => Promise<void>;
}

export interface ContextMenuData {
  data: ContextMenuCommandBuilder;
  execute: (
    lunarAssistant: LunarAssistant,
    interaction: ContextMenuCommandInteraction
  ) => Promise<void>;
}

export interface ButtonData {
  customId: string;
  execute: (
    lunarAssistant: LunarAssistant,
    interaction: ButtonInteraction
  ) => Promise<void>;
}

export interface ModalData {
  customId: string;
  execute: (
    lunarAssistant: LunarAssistant,
    interaction: ModalSubmitInteraction
  ) => Promise<void>;
}

export type ComplexRuleMode = "&&" | "||" | "custom";

import { SlashCommandBuilder } from "@discordjs/builders";
import {
  Attachment,
  AttachmentBuilder,
  ChatInputCommandInteraction,
  CommandInteraction,
  GuildMember,
} from "discord.js";
import { LunarAssistant } from "..";
import { api } from "../services/api";
const logger = require('../logging/logger');

export default {
  data: new SlashCommandBuilder()
    .setName("lunar-view-roles")
    .setDescription(
      "View the roles that you have been granted based on the contents of your wallet."
    )
    .addBooleanOption((option) =>
      option
        .setName("private-response")
        .setDescription(
          "Indicate whether or not the response should be public or private. Private by default."
        )
    ),
  execute: async (
    lunarAssistant: LunarAssistant,
    interaction: ChatInputCommandInteraction
  ) => {
    // verify the interaction is valid
    if (!interaction.guildId || !interaction.guild || !interaction.member)
      return;

    const rawPrivateResponse =
      interaction.options.getBoolean("private-response");
    const privateResponse =
      rawPrivateResponse || rawPrivateResponse == null ? true : false;

    await interaction.deferReply({ ephemeral: privateResponse });

    try
    {
      const guild = lunarAssistant.client.guilds.cache.get(interaction.guildId);
      if (!guild) return;

      let activeRolesMessage = "Your current roles on this server: ";
      // Get the member from the guild
      let member = guild.members.cache.get(interaction.user.id)
      if(member)
      {

        // Get list of roles from database to only include those in the output of the command.
        let getRulesResponse;
        getRulesResponse = await api.getNftRules(interaction.guildId);
        let dbRoles: string[] = [];
        for(let indexR = 0; indexR < getRulesResponse.rules.length; indexR++)
        {
          const roleName = member.roles.cache.get(getRulesResponse.rules[indexR].role)?.name
          if(roleName)
          {
            dbRoles.push(roleName);
          }
        }

        for(let index = 0; index < member.roles.cache.size; index++ )
        {
          const role = member.roles.cache.at(index);
          if(role && dbRoles.includes(role.name))
          {
            activeRolesMessage = activeRolesMessage + role.name + ", ";
          }
        }
      }

      const message = `Hello ser! You currently have the following roles on this discord server:\n\n${activeRolesMessage}\n\nBuilt by GraviDAO`;

      if (message.length > 2000) {
        await interaction.editReply({
          content:
            "Hello ser! Your roles are attached. They are sent as a file instead of a message because you have so many roles that they can't fit into a single message, congrats!\n\nBuilt by GraviDAO",
          files: [
            new AttachmentBuilder(Buffer.from(message), {
              name: `your-roles.txt`,
            }),
          ],
        });
      } else {
        await interaction.editReply({
          content: message,
        });
      }
    } catch (e)
    {
      logger.error("Unknown error when running /lunar-view-roles:");
      logger.error(e);

      await interaction.editReply({
        content: "There was an unknown error while executing this command!",
      });
    }
  },
};
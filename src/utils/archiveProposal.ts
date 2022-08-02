import { GuildChannel, Message } from "discord.js";
import { proposalResultsEmbed } from "./embeds";
import { LunarAssistant } from "..";
import { GetProposalResultsResponse, Proposal } from "../shared/apiTypes";
import { castProposalVoteButtons } from "./buttons";
import { api } from "../services/api";

export const archiveProposal = async (
  lunarAssistant: LunarAssistant,
  message: Message,
  proposal: Proposal
) => {
  try {
    await api.closeProposal(message.guildId!, proposal.id.toString());
  } catch (error) {
    console.log(`Could not close proposal: ${proposal.id}`);
    return;
  }

  console.log(`Archiving poll: ${proposal.id}`);
  await message.edit({ components: [castProposalVoteButtons(false)] });
  if (message.thread && !message.thread.archived) {
    try {
      await message.thread.setArchived(true, "Poll Closed");
    } catch (error) {
      console.log(`Could not archive thread: ${message.thread.name}`);
    }
  }

  let results: GetProposalResultsResponse;
  try {
    results = await api.getProposalResults(
      message.guildId!,
      proposal.id.toString()
    );
  } catch (error) {
    console.log(`Could not get proposal results: ${proposal.id}`);
    return;
  }

  try {
    await message.reply({
      embeds: [proposalResultsEmbed(proposal, results.choices)],
    });
  } catch (error) {
    console.log(
      `Could not post results for poll on: ${
        (message.channel as GuildChannel).name
      }`
    );
  }
};

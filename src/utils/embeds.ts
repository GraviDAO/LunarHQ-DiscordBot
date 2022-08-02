import { Colors, EmbedBuilder, Formatters, User } from "discord.js";
import { CreateProposal, Proposal, ProposalChoice, Poll } from "../shared/apiTypes";

export function primaryEmbed(
  title: string | undefined = undefined,
  description: string | undefined = undefined
) {
  return new EmbedBuilder({
    title: title,
    description: description,
    color: Colors.Blurple,
  });
}

export function secondaryEmbed(
  title: string | undefined = undefined,
  description: string | undefined = undefined
) {
  return new EmbedBuilder({
    title: title,
    description: description,
    color: Colors.DarkAqua,
  });
}

export function proposalEmbed(data: Proposal, author: User) {
  return new EmbedBuilder({
    title: `Poll #${data.id} | ${data.title}`,
    description: data.description,
    footer: {
      text: data.id.toString(),
    },
    timestamp: Date.now().toString(),
    color: Colors.Blurple,
    author: {
      name: author.tag,
      icon_url: author.avatarURL() ?? undefined,
    },
    fields: [
      // {
      //   name: "End Time",
      //   value: `${Formatters.time(
      //     parseInt((data.endDate / 1000).toFixed(0)),
      //     "F"
      //   )} (${Formatters.time(
      //     parseInt((data.endDate / 1000).toFixed(0)),
      //     "R"
      //   )})`,
      //   inline: true,
      // },
      {
        name: "Quorum",
        value: data.quorum ? `${data.quorum} Votes` : "Not Specified",
        inline: true,
      },
    ],
  });
}

export function proposalResultsEmbed(
  data: Proposal,
  results: ProposalChoice[]
) {
  return new EmbedBuilder({
    title: `Results for Proposal #${data.id} | __${data.title}__`,
    footer: {
      text: "Built by GraviDAO",
    },
    fields: [
      {
        name: "Total Valid votes",
        value: `\`\`\`${results!.length}\`\`\``,
        inline: true,
      },
      {
        name: "󠀠",
        value: "󠀠",
        inline: true,
      },
      {
        name: "Status",
        value: data.status.toUpperCase(),
        inline: true,
      },
      {
        name: "✅ | Yes Votes",
        value: `\`\`\`${results.find(
          (value: ProposalChoice) => value.choice === "yes"
        )}\`\`\``,
        inline: true,
      },
      {
        name: "❌ | No Votes",
        value: `\`\`\`${results.find(
          (value: ProposalChoice) => value.choice === "no"
        )}\`\`\``,
        inline: true,
      },
      {
        name: "🚫 | Abstain Votes",
        value: `\`\`\`${results.find(
          (value: ProposalChoice) => value.choice === "abstain"
        )}\`\`\``,
        inline: true,
      },
    ],
    timestamp: Date.now().toString(),
    color: Colors.Blurple,
  });
}

export function pollsEmbed(polls: Poll[]) {
  return new EmbedBuilder({
    title: "Server Polls",
    description:
      polls.length === 0 ? "No polls have been have been found" : undefined,
    color: Colors.Blurple,
    fields: polls.map((p: Poll) => {
      return {
        name: p.title,
        value: `__Creator:__ ${Formatters.userMention(p.creator)}(${
          p.creator
        })\n${
          p.votes.yes.length + p.votes.no.length + p.votes.abstain.length ?? 0
        } votes`,
      };
    }),
  });
}

export function proposalsEmbed(proposals: Proposal[]) {
  return new EmbedBuilder({
    title: "Server Proposals",
    description:
      proposals.length === 0 ? "No polls have been have been found" : undefined,
    color: Colors.Blurple,
    fields: proposals.map((p: Proposal) => {
      return {
        name: p.title,
        value: `__Creator:__ ${Formatters.userMention(p.creatorDiscordId)}(${
          p.creatorDiscordId
        })\n`,
      };
    }),
  });
}

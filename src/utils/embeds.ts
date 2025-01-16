import {
  APIRole,
  codeBlock,
  Colors,
  EmbedBuilder,
  EmbedField,
  inlineCode,
  italic,
  Role,
  roleMention,
  time,
  unorderedList,
  User,
  userMention,
} from "discord.js";
import {
  GenericRule,
  Poll,
  Proposal,
  ProposalChoice,
} from "../shared/apiTypes";
import { toPascalCase } from "./helper";

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
    timestamp: Date.now(),
    color: Colors.Blurple,
    author: {
      name: author.tag,
      icon_url: author.avatarURL() ?? undefined,
    },
    fields: [
      {
        name: "End Time",
        value: `${time(
          parseInt((new Date(data.endDate).getTime() / 1000).toFixed(0)),
          "F"
        )} (${time(
          parseInt((new Date(data.endDate).getTime() / 1000).toFixed(0)),
          "R"
        )})`,
        inline: true,
      },
      {
        name: "Quorum",
        value: data.quorum
          ? `${data.quorum}% of votes required`
          : "Not Specified",
        inline: true,
      },
    ],
  });
}

export function proposalResultsEmbed(
  data: Proposal,
  results: ProposalChoice[]
) {
  const totalVotes = results.reduce(
    (previousResult, currentResult) => previousResult + currentResult.votes,
    0
  );

  return new EmbedBuilder({
    title: `Results for Proposal #${data.id} | __${data.title}__`,
    footer: {
      text: "Built by GraviDAO",
    },
    fields: [
      {
        name: "Total Valid votes",
        value: `\`\`\`${totalVotes}\`\`\``,
        inline: true,
      },
      {
        name: "󠀠",
        value: "󠀠",
        inline: true,
      },
      {
        name: "Status",
        value: toPascalCase(data.status),
        inline: true,
      },
      {
        name: "✅ | Yes Votes",
        value: `\`\`\`${
          results.filter((value: ProposalChoice) => value.choice === "Yes")[0]
            .votes
        }\`\`\``,
        inline: true,
      },
      {
        name: "❌ | No Votes",
        value: `\`\`\`${
          results.filter((value: ProposalChoice) => value.choice === "No")[0]
            .votes
        }\`\`\``,
        inline: true,
      },
      {
        name: "🚫 | Abstain Votes",
        value: `\`\`\`${
          results.filter(
            (value: ProposalChoice) => value.choice === "Abstain"
          )[0].votes
        }\`\`\``,
        inline: true,
      },
    ],
    timestamp: Date.now(),
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
        value: `__Creator:__ ${userMention(p.creator)}(${p.creator})\n${
          p.votes.yes.length + p.votes.no.length + p.votes.abstain.length
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
        value: `__Creator:__ ${userMention(p.creatorDiscordId)}(${
          p.creatorDiscordId
        })\n`,
      };
    }),
  });
}

export function lunarAssistantPanelEmbed() {
  return new EmbedBuilder({
    title: "Link your ownership",
    description:
      "Lunar Assistant verifies your web3 ownership on Discord.\nLink your wallet to get started, leave the rest to us.\n:black_small_square: :white_small_square: :black_small_square: :white_small_square:\n*P.S. Don't be stupid, Never share seeds or keys. DYOR.*",
    color: 65535,
    footer: {
      text: "Built by GraviDAO",
    },
    thumbnail: {
      url: "https://cdn.discordapp.com/attachments/911237611371241492/1011786559021907968/Lunar_Assistant_Mascotte_2.3.png",
    },
  });
}

export function createComplexRuleEmbed(data: {
  role: Role | APIRole;
  rules: GenericRule[];
  selected: string[];
  phase: number;
  expression: string;
}) {
  const selectedRules = data.rules.filter((r) => data.selected.includes(r.id));

  return new EmbedBuilder({
    title: "Creating new Complex Rule",
    description: "Please select all rules that must be met to unlock this role",
    color: 65535,
    fields: [
      {
        name: "Role",
        value: roleMention(data.role.id),
        inline: false,
      },
      {
        name: "Rules Selected",
        value:
          selectedRules.length > 0
            ? selectedRules.map((r) => r.id).join(", ")
            : "No rules selected yet",
        inline: true,
      },
      ...([
        ...(data.phase === 1
          ? [
              {
                name: "Expression",
                value: codeBlock(data.expression),
                inline: true,
              },
              {
                name: "Guide",
                value: `${italic(
                  "How to setup rules:"
                )}\nThere are 3 types of rules:\n${unorderedList([
                  `${italic("AND")}: All rules must be met to unlock the role`,
                  `${italic(
                    "OR"
                  )}: At least one rule must be met to unlock the role`,
                  `${italic(
                    "Custom"
                  )}: You can write your own expression using the rules`,
                ])}\n${italic("Examples:")}\n${codeBlock(
                  "N-1 && N-2 || N-3"
                )}${codeBlock("T-1 || T-2")}${codeBlock(
                  "N-1 && T-1 || N-2"
                )}\nYou can use ${inlineCode("&&")}, ${inlineCode(
                  "||"
                )} operators to combine rules and parentheses ${inlineCode(
                  "("
                )} or ${inlineCode(")")} to group them.`,
                inline: false,
              },
            ]
          : []),
      ].filter(Boolean) as EmbedField[]),
    ],

    footer: {
      text: "Built by GraviDAO",
    },
    thumbnail: {
      url: "https://cdn.discordapp.com/attachments/911237611371241492/1011786559021907968/Lunar_Assistant_Mascotte_2.3.png",
    },
  });
}

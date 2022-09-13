import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SelectMenuBuilder,
} from "discord.js";

export function castProposalVoteButtons(enabled: boolean = true) {
  return new ActionRowBuilder<ButtonBuilder>({
    components: [
      new ButtonBuilder({
        customId: "proposalVote.yes",
        label: "Yes",
        style: ButtonStyle.Success,
        disabled: !enabled,
      }),
      new ButtonBuilder({
        customId: "proposalVote.no",
        label: "No",
        style: ButtonStyle.Danger,
        disabled: !enabled,
      }),
      new ButtonBuilder({
        customId: "proposalVote.abstain",
        label: "Abstain",
        style: ButtonStyle.Primary,
        disabled: !enabled,
      }),
      new ButtonBuilder({
        customId: "proposalVote.clear",
        label: "Reset",
        style: ButtonStyle.Secondary,
        disabled: !enabled,
      }),
    ],
  });
}

export function confirmButtons(needle: string) {
  return new ActionRowBuilder<ButtonBuilder>({
    components: [
      new ButtonBuilder({
        customId: `${needle}Confirm`,
        label: "Confirm",
        style: ButtonStyle.Success,
      }),
      new ButtonBuilder({
        customId: `${needle}Cancel`,
        label: "Cancel",
        style: ButtonStyle.Danger,
      }),
    ],
  });
}

export function blockchainNameChoices() {
  return new ActionRowBuilder<SelectMenuBuilder>({
    components: [
      new SelectMenuBuilder({
        customId: "blockchainPicker",
        options: [
          { label: "Polygon", value: "polygon-mainnet" },
          { label: "Terra", value: "Terra" },
          //{ label: "Terra Classic", value: "Terra Classic" },
        ],
      }),
    ],
  });
}

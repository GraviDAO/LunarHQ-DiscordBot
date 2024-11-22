import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SelectMenuBuilder,
} from "discord.js";
import { WEBAPP_URL, publicInfo } from "../../config.json";

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
          { label: "Terra Classic", value: "Terra Classic" },
          { label: "Stargaze", value: "Stargaze" },
          // { label: "Archway", value: "Archway" },
          // { label: "Juno", value: "Juno" },
          // { label: "Osmosis", value: "Osmosis" },
          // { label: "Migaloo", value: "Migaloo" },
          { label: "Injective", value: "Injective" },
          // { label: "Neutron", value: "Neutron" },
        ],
      }),
    ],
  });
}

export function lunarAssistantPanelButtons() {
  return new ActionRowBuilder<ButtonBuilder>({
    components: [
      new ButtonBuilder({
        url: WEBAPP_URL,
        label: "Lunar Link",
        style: ButtonStyle.Link,
      }),
      new ButtonBuilder({
        customId: "viewRoles",
        label: "View Roles",
        style: ButtonStyle.Secondary,
      }),
      new ButtonBuilder({
        url: publicInfo.website,
        label: "Website",
        style: ButtonStyle.Link,
      }),
      new ButtonBuilder({
        url: publicInfo.socials,
        label: "Socials",
        style: ButtonStyle.Link,
      }),
    ],
  });
}

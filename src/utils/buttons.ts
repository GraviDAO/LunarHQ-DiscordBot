import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SelectMenuBuilder,
  StringSelectMenuBuilder,
} from "discord.js";
import chains from "../../blockchains.json";
import { WEBAPP_URL, publicInfo } from "../../config.json";
import { GenericRule } from "../shared/apiTypes";
import { ComplexRuleMode } from "../types";

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
        options: Object.values(chains)
          .filter((chain) => chain.enabled)
          .map((chain) => ({
            label: chain.name,
            value: chain.value,
          })),
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

export function createComplexRuleButtons(
  phase: number,
  all: GenericRule[],
  selected: string[],
  mode: ComplexRuleMode = "&&"
): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] {
  const nRules = all.filter((rule) => rule.id.startsWith("N"));
  const tRules = all.filter((rule) => rule.id.startsWith("T"));

  switch (phase) {
    case 0: {
      return [
        new ActionRowBuilder<StringSelectMenuBuilder>({
          components: [
            new StringSelectMenuBuilder({
              customId: "cr.rulePicker.n",
              placeholder: "Select as many NFT Rules as you want",
              minValues: Math.min(1, nRules.length),
              maxValues: nRules.length,
              options: nRules.map((rule) => ({
                label: rule.id,
                value: rule.id,
                default: selected.includes(rule.id),
              })),
            }),
          ],
        }),
        new ActionRowBuilder<StringSelectMenuBuilder>({
          components: [
            new StringSelectMenuBuilder({
              customId: "cr.rulePicker.t",
              placeholder: "Select as many Token Rules as you want",
              minValues: Math.min(1, tRules.length),
              maxValues: tRules.length,
              options: tRules.map((rule) => ({
                label: rule.id,
                value: rule.id,
                default: selected.includes(rule.id),
              })),
            }),
          ],
        }),
        new ActionRowBuilder<ButtonBuilder>({
          components: [
            new ButtonBuilder({
              customId: "cr.next",
              label: "Next",
              style: ButtonStyle.Primary,
              disabled: selected.length < 2,
            }),
            new ButtonBuilder({
              customId: "cr.cancel",
              label: "Cancel",
              style: ButtonStyle.Danger,
            }),
          ],
        }),
      ];
    }
    case 1: {
      return [
        new ActionRowBuilder<ButtonBuilder>({
          components: [
            new ButtonBuilder({
              customId: "cr.mode.and",
              label: "AND",
              style:
                mode === "&&" ? ButtonStyle.Success : ButtonStyle.Secondary,
            }),
            new ButtonBuilder({
              customId: "cr.mode.or",
              label: "OR",
              style:
                mode === "||" ? ButtonStyle.Success : ButtonStyle.Secondary,
            }),
            new ButtonBuilder({
              customId: "cr.mode.custom",
              label: "Custom",
              style:
                mode === "custom" ? ButtonStyle.Success : ButtonStyle.Secondary,
            }),
          ],
        }),
        new ActionRowBuilder<ButtonBuilder>({
          components: [
            new ButtonBuilder({
              customId: "cr.finish",
              label: "Finish",
              style: ButtonStyle.Primary,
            }),
            new ButtonBuilder({
              customId: "cr.cancel",
              label: "Cancel",
              style: ButtonStyle.Danger,
            }),
          ],
        }),
      ];
    }
  }
  return [];
}

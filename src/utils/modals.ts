import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export function proposalCreateModal() {
  return new ModalBuilder({
    customId: "create-proposal",
    title: "Create a proposal",
    components: [
      new ActionRowBuilder<TextInputBuilder>({
        components: [
          new TextInputBuilder({
            customId: "nftAddress",
            label: "NFT Address",
            minLength: 5,
            maxLength: 256,
            placeholder: "NFT Collection Address",
            required: true,
            style: TextInputStyle.Short,
          }),
        ],
      }),
      new ActionRowBuilder<TextInputBuilder>({
        components: [
          new TextInputBuilder({
            customId: "title",
            label: "Proposal title",
            minLength: 5,
            maxLength: 50,
            placeholder: "New Proposal Title",
            required: true,
            style: TextInputStyle.Short,
          }),
        ],
      }),
      new ActionRowBuilder<TextInputBuilder>({
        components: [
          new TextInputBuilder({
            customId: "description",
            label: "Proposal description",
            minLength: 20,
            maxLength: 4000,
            placeholder: "New Proposal Description",
            required: true,
            style: TextInputStyle.Paragraph,
          }),
        ],
      }),
      new ActionRowBuilder<TextInputBuilder>({
        components: [
          new TextInputBuilder({
            customId: "quorum",
            label: "Quorum (% of votes needed)",
            minLength: 0,
            maxLength: 4000,
            placeholder: "e.g.: 20",
            required: false,
            style: TextInputStyle.Short,
          }),
        ],
      }),
      new ActionRowBuilder<TextInputBuilder>({
        components: [
          new TextInputBuilder({
            customId: "time",
            label: "End Time (Default: 14d)",
            minLength: 0,
            maxLength: 4000,
            placeholder: "Examples: 1m,1h,1d",
            required: false,
            style: TextInputStyle.Short,
          }),
        ],
      }),
    ],
  });
}

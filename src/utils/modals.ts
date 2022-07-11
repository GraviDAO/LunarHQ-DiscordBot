import { MessageActionRow, Modal, TextInputComponent } from "discord.js";

export function pollCreateModal() {
  return new Modal({
    customId: "create-poll",
    title: "Create a poll",
    components: [
      new MessageActionRow({
        components: [
          new TextInputComponent({
            customId: "nftAddress",
            label: "NFT Address",
            minLength: 5,
            maxLength: 256,
            placeholder: "NFT Collection Address",
            required: true,
            style: "SHORT",
          }),
          new TextInputComponent({
            customId: "description",
            label: "Poll description",
            minLength: 20,
            maxLength: 4000,
            placeholder: "New Poll Description",
            required: true,
            style: "PARAGRAPH",
          }),
          new TextInputComponent({
            customId: "quorum",
            label: "Quorum (Number of votes needed)",
            minLength: 0,
            maxLength: 4000,
            placeholder: "e.g.: 40",
            required: false,
            style: "SHORT",
          }),
          new TextInputComponent({
            customId: "time",
            label: "End Time (Default: 14d)",
            minLength: 0,
            maxLength: 4000,
            placeholder: "Examples: 1m,1h,1d",
            required: false,
            style: "SHORT",
          }),
        ],
      }),
    ],
  });
}

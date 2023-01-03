/* eslint-disable @typescript-eslint/no-unused-vars */
import Discord from "discord.js";
import type { CommandReactionsArgs } from "../types";

//TODO: Wait for discord to release SelectMenu input inside modals.
const createIssueModal = ({ client, interaction }: CommandReactionsArgs) => {
  const btn = new Discord.ButtonBuilder().setCustomId("");
  const modal = new Discord.ModalBuilder().setCustomId("issue-modal");

  const favoriteColorInput = new Discord.TextInputBuilder()
    .setCustomId("favoriteColorInput")
    .setLabel("What's your favorite color?")
    .setStyle(Discord.TextInputStyle.Short);

  const hobbiesInput = new Discord.TextInputBuilder()
    .setCustomId("hobbiesInput")
    .setLabel("What's some of your favorite hobbies?")
    .setStyle(Discord.TextInputStyle.Paragraph);

  const select = new Discord.SelectMenuBuilder()
    .setCustomId("hobbiesInput")
    .addOptions([
      new Discord.SelectMenuOptionBuilder().setValue(""),
      new Discord.SelectMenuOptionBuilder().setValue(""),
    ]);

  const firstActionRow =
    new Discord.ActionRowBuilder<Discord.TextInputBuilder>().addComponents(
      favoriteColorInput
    );

  const secondActionRow =
    new Discord.ActionRowBuilder<Discord.TextInputBuilder>().addComponents(
      hobbiesInput
    );

  const thirdActionRow =
    new Discord.ActionRowBuilder<Discord.SelectMenuBuilder>().addComponents(
      select
    );

  modal.addComponents([firstActionRow, secondActionRow]);

  return modal;
};

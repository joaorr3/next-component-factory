import type Discord from "discord.js";
import type { CommandName } from "../bot/types";
import { getUserById } from "../bot/users";
import { getGuild } from "../bot/utils";
import { logger } from "./logger";

// export type EnvConfig = {
//   DISCORD_BOT_TOKEN: string;
//   DISCORD_CLIENT_ID: string;
//   GUILD_NAME: string;
//   GUILD_ID: string;
//   NOTION_TOKEN: string;
//   NOTION_ISSUES_DB_ID: string;
//   capabilities: {
//     discord: boolean;
//     notion: boolean;
//     prisma: boolean;
//   };
// };

// export const config = (): EnvConfig => ({
//   DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN ?? "",
//   DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID ?? "",
//   GUILD_NAME: process.env.GUILD_NAME ?? "",
//   GUILD_ID: process.env.GUILD_ID ?? "",
//   NOTION_TOKEN: process.env.NOTION_TOKEN ?? "",
//   NOTION_ISSUES_DB_ID: process.env.NOTION_ISSUES_DB_ID ?? "",
//   capabilities: {
//     discord: process.env.START_DISCORD === "true",
//     notion: process.env.START_NOTION === "true",
//     prisma: process.env.START_PRISMA === "true",
//   },
// });

export const sleep = (t: number) =>
  new Promise((resolve) => setTimeout(resolve, t));

export const csvToNumberedList = (text: string) =>
  text
    .split(";")
    .filter((step) => !!step)
    .map((item, i) => `${i + 1}. ${item}`)
    .join("\n");

export const randomInt = (min = 1, max = 10) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const isValidURL = (url?: string | null) => {
  if (!url) {
    return false;
  }
  try {
    new URL(url);
  } catch (err) {
    return false;
  }
  return true;
};

export const logInteraction = ({
  client,
  commandName,
  interaction,
  commandResponse,
}: {
  interaction: Discord.Interaction<Discord.CacheType>;
  commandName: CommandName;
  client: Discord.Client<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  commandResponse: any;
}) => {
  const guild = getGuild(client);
  if (guild) {
    const requestor = getUserById(guild, interaction.user.id);

    const logMessage = {
      requestedBy: requestor?.displayName,
      commandName,
      commandResponse,
      channelUrl: interaction.channel?.url,
      channelId: interaction.channel?.id,
    };

    try {
      logger.db.discord({
        level: "info",
        message: `[Interaction] -> ${JSON.stringify(logMessage)}`,
      });
    } catch (error) {
      logger.console.discord({
        level: "error",
        message: JSON.stringify(error),
      });
    }
  }
};

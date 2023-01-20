import type Discord from "discord.js";
import { z } from "zod";
import type { CommandName } from "../bot/types";
import { getUserById } from "../bot/users";
import { getGuild } from "../bot/utils";
import { logger } from "./logger";

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

//region URL Validation
const urlValidator = z.string().url();
export const isValidURL = (_url?: string | null) => {
  const url = urlValidator.safeParse(_url);
  return url.success;
};
//endregion

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

export async function promisify<T extends () => void>(
  cb: T,
  debugMessage?: string
) {
  return Promise.resolve()
    .then(() => {
      cb();
    })
    .catch((error) => {
      const errorMessage = {
        label: "[promisify]",
        details: debugMessage || "",
        error,
      };

      logger.db.server({
        level: "error",
        message: JSON.stringify(errorMessage),
      });
    });
}

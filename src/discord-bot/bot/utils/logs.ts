import type Discord from "discord.js";
import { getTextChannel } from "../channels";
import { GuildChannelName } from "../constants";

function getErrorStack(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.stack;
  return "Unknown Error";
}

export function baseBotLogger(name?: string) {
  return (
    guild: Discord.Guild,
    messageFn: () => Discord.BaseMessageOptions
  ) => {
    const botsChannel = getTextChannel(guild, { name });
    if (!botsChannel) return;

    const message: Discord.BaseMessageOptions = messageFn();

    const callerStack = new Error("Caller stack:");

    // make sure sync errors don't crash the bot
    return Promise.resolve()
      .then(() => botsChannel.send(message))
      .catch((error: unknown) => {
        const messageSummary = message.content;

        console.error(
          `Unable to log message: "${messageSummary}"`,
          getErrorStack(error),
          callerStack
        );
      });
  };
}

export const log = baseBotLogger(GuildChannelName.debugBotLogs);
export const publicLog = baseBotLogger(GuildChannelName.botLogs);

export const prLog = baseBotLogger(GuildChannelName.pr);
export const buildLog = baseBotLogger(GuildChannelName.releases);
export const workItemLog = baseBotLogger(GuildChannelName.workItem);

import type Discord from "discord.js";
import { getTextChannel } from "../channels";

function getErrorStack(error: unknown) {
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.stack;
  return "Unknown Error";
}

export function log(
  guild: Discord.Guild,
  messageFn: () => string | Discord.EmbedBuilder
) {
  const botsChannel = getTextChannel(guild, { name: "bot-logs" });
  if (!botsChannel) return;

  let message: Discord.BaseMessageOptions;
  try {
    const result = messageFn();
    if (typeof result === "string") {
      message = { content: result };
    } else {
      message = { embeds: [result] };
    }
  } catch (error: unknown) {
    console.error(`Unable to get message for bot log`, getErrorStack(error));
    return;
  }

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
}

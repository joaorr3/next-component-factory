import type Discord from "discord.js";
import { promisify } from "../../utils";
import { getTextChannel } from "../channels";
import { GuildChannelName } from "../constants";

export function baseBotLogger(name?: string) {
  return (
    guild: Discord.Guild,
    messageFn: () => Discord.BaseMessageOptions
  ) => {
    const botsChannel = getTextChannel(guild, { name });
    if (!botsChannel) return;
    const message: Discord.BaseMessageOptions = messageFn();
    promisify(() => botsChannel.send(message), message.content);
  };
}

export const log = baseBotLogger(GuildChannelName.debugBotLogs);
export const publicLog = baseBotLogger(GuildChannelName.botLogs);

export const prLog = baseBotLogger(GuildChannelName.pr);
export const buildLog = baseBotLogger(GuildChannelName.releases);
export const workItemLog = baseBotLogger(GuildChannelName.workItem);

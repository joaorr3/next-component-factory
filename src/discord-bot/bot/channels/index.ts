import Discord, { FormattingPatterns } from "discord.js";
import { logger } from "../../utils/logger";
import type { ChannelType } from "../types";

export const guildChannelUrl = (id: string) =>
  `https://discord.com/channels/973878486739591208/${id}`;

function getChannel(
  guild: Discord.Guild | null,
  {
    id,
    name,
    type = Discord.ChannelType.GuildText,
  }: { id?: string; name?: string; type?: ChannelType }
) {
  const finder = (ch: Discord.GuildBasedChannel) => {
    return id ? ch.id === id : ch.name === name && ch.type === type;
  };

  const channel = guild?.channels.cache.find(finder);

  if (!channel) {
    logger.db.discord({
      level: "warn",
      message: "Ups! No channel",
    });

    return null;
  }

  return channel;
}

export const getTextChannel = (
  guild: Discord.Guild | null,
  { id, name }: { id?: string; name?: string }
): Discord.TextChannel | null => {
  const textChannel = getChannel(guild, {
    id,
    name,
    type: Discord.ChannelType.GuildText,
  });

  return textChannel as Discord.TextChannel | null;
};

export const getTextChannelByMention = (
  guild: Discord.Guild | null,
  channelMention: string
): Discord.TextChannel | null => {
  const channelRegEx = new RegExp(FormattingPatterns.Channel, "g");
  const match = channelMention?.matchAll(channelRegEx).next().value as string[];

  try {
    if (match) {
      const channelId = match[1] ?? undefined;

      const channel = getTextChannel(guild, { id: channelId });

      return channel;
    }
  } catch (error) {
    logger.db.discord({
      level: "error",
      message: "Finding channel by mention.",
    });
  }
  return null;
};

export const getThreadChannel = (
  guild: Discord.Guild | null,
  { id, name }: { id?: string; name?: string }
): Discord.ThreadChannel | null => {
  const textChannel = getChannel(guild, {
    id,
    name,
    type: Discord.ChannelType.GuildPublicThread,
  });

  return textChannel as Discord.ThreadChannel | null;
};

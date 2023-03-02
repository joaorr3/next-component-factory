import { type TextChannel } from "discord.js";
import logger from "../../../shared/logger";
import prisma from "../../data";

export const channelUpdateHandler = async (_channel: TextChannel) => {
  try {
    const channel = await _channel.fetch();
    prisma.labs.updateLabByChannelId(channel.id, {
      channelName: channel.name,
    });
  } catch (error) {
    logger.db.discord({
      level: "error",
      message: `[ChannelUpdateHandler] -> ${JSON.stringify(error)}`,
    });
  }
};

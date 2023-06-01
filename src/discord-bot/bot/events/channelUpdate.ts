import { type TextChannel } from "discord.js";
import logger from "../../../shared/logger";
import prisma from "../../data";

export const channelUpdateHandler = async (_channel: TextChannel) => {
  try {
    const channel = await _channel.fetch();
    await prisma.labs.updateLabByChannelId(channel.id, {
      channelName: channel.name,
    });

    logger.db.discord({
      level: "info",
      message: `[ChannelUpdateHandler] -> ${JSON.stringify({
        channel: {
          id: channel.id,
          name: channel.name,
        },
      })}`,
    });
  } catch (error) {
    logger.db.discord({
      level: "error",
      message: `[ChannelUpdateHandler] -> ${JSON.stringify(error)}`,
    });
  }
};

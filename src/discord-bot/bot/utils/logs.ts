import { type CacheType, type Interaction } from "discord.js";
import logger from "../../logger";
import discord from "../client";
import { type CommandName } from "../types";

export const log = discord.logger("debugBotLogs");
export const publicLog = discord.logger("botLogs");

export const prLog = discord.logger("pr");
export const buildLog = discord.logger("releases");
export const workItemLog = discord.logger("workItem");

export const webhooksLog = discord.logger("webhookLogs");

export const logInteraction = ({
  commandName,
  interaction,
  commandResponse,
}: {
  interaction: Interaction<CacheType>;
  commandName: CommandName;
  commandResponse: unknown;
}) => {
  if (discord.guild) {
    const requestor = discord.member(interaction.user.id);

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

import { type GuildMember, type PartialGuildMember } from "discord.js";
import prisma, { DataUtils } from "../../data";
import logger from "../../../shared/logger";
import discord from "../client";

export const guildMemberUpdateHandler = async (
  member: GuildMember | PartialGuildMember
) => {
  try {
    const cachedGuildMember = discord.member(member.id);
    if (cachedGuildMember) {
      const guildMember = await cachedGuildMember.fetch();
      const guildUser = DataUtils.transformGuildMemberData(guildMember);
      const response = await prisma?.guildUser.upsertGuildUser(guildUser);
      if (response) {
        logger.db.discord({
          level: "info",
          message: `[GuildMemberUpdate(${response.action})] -> ${JSON.stringify(
            response.guildUser
          )}`,
        });
      }
    }
  } catch (error) {
    logger.db.discord({
      level: "error",
      message: `[GuildMemberUpdate] -> ${JSON.stringify(error)}`,
    });
  }
};

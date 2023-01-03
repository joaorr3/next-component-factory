import type Discord from "discord.js";
import { FormattingPatterns } from "discord.js";
import { logger } from "../../utils/logger";

export const getRole = (
  guild: Discord.Guild | undefined,
  {
    name,
    mention,
  }: {
    name?: string | null;
    mention?: string | null;
  }
) => {
  if (name) {
    return guild?.roles.cache.find((role) => role.name === name);
  }
  try {
    const roleReg = new RegExp(FormattingPatterns.Role, "g");
    const parsedRole = mention?.matchAll(roleReg).next().value as string[];

    if (parsedRole) {
      const roleId = parsedRole[1] ?? undefined;
      return guild?.roles.cache.find((role) => role.id === roleId);
    }
  } catch (error) {
    logger.db.discord({ level: "error", message: `hasRole: ${error}` });
  }
};

export const hasRoleByMention = (
  guildUser: Discord.GuildMember | undefined,
  roleMention: string | null
) => {
  const role = getRole(guildUser?.guild, { mention: roleMention });

  if (role) {
    return guildUser?.roles.cache.has(role?.id);
  }
};

export const hasRole = (
  guildUser: Discord.GuildMember | undefined,
  role?: Discord.Role | Discord.APIRole | null
) => {
  if (role) {
    return guildUser?.roles.cache.has(role?.id);
  }
};
export const hasRoleByName = (
  guildUser: Discord.GuildMember | undefined,
  roleName: string | null
) => {
  const role = getRole(guildUser?.guild, { name: roleName });

  if (role) {
    return guildUser?.roles.cache.has(role?.id);
  }
};

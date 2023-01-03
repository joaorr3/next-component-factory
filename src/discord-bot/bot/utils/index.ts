import type Discord from "discord.js";
import { config } from "../../utils";
import { RoleAction } from "../commands/enums";
import { GuildRoles } from "../constants";
import { getRole } from "../roles";
import { getUserById } from "../users";

export * as Gif from "./gifs";
export * as Quotes from "./quotes";
export * as BotLog from "./logs";

export const getGuild = (client: Discord.Client): Discord.Guild | undefined => {
  const { GUILD_NAME } = config();
  const guild = client.guilds.cache.find(({ name }) => name === GUILD_NAME);
  return guild;
};

export const visitorRole = async ({
  action,
  userId,
  guild,
}: {
  action: RoleAction;
  userId: string;
  guild?: Discord.Guild;
}) => {
  if (guild) {
    const guildUser = getUserById(guild, userId);
    const visitorRole = getRole(guild, { name: GuildRoles.visitor });
    if (visitorRole) {
      if (action === RoleAction.give) {
        await guildUser?.roles.add(visitorRole);
      } else {
        await guildUser?.roles.remove(visitorRole);
      }
    }
  }
};

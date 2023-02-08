import type Discord from "discord.js";
import { env } from "../../../env/server";
import discord from "../client";
import { RoleAction } from "../commands/enums";

export * as Gif from "./gifs";
export * as BotLog from "./logs";
export * as Quotes from "./quotes";

export const getGuild = (client: Discord.Client): Discord.Guild | undefined => {
  const guild = client.guilds.cache.find(({ name }) => name === env.GUILD_NAME);
  return guild;
};

export const visitorRole = async ({
  action,
  userId,
}: {
  action: RoleAction;
  userId: string;
}) => {
  const guildUser = discord.member(userId);
  const visitorRole = discord.role("visitor");

  if (visitorRole) {
    if (action === RoleAction.give) {
      await guildUser?.roles.add(visitorRole);
    } else {
      await guildUser?.roles.remove(visitorRole);
    }
  }
};

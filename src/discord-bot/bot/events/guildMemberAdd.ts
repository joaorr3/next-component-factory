import { userMention, type GuildMember } from "discord.js";
import discord from "../client";
import { RoleAction } from "../commands/enums";
import { visitorRole } from "../utils";

export const guildMemberAddHandler = async (member: GuildMember) => {
  const welcomeMessage = `What's up ${userMention(
    member.user.id
  )}? Ask me for roles. /roles`;

  await discord.channel("welcome")?.send({
    content: welcomeMessage,
  });

  await visitorRole({
    action: RoleAction.get,
    userId: member.user.id,
  });
};

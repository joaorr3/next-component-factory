import { userMention, channelMention, type GuildMember } from "discord.js";
import discord from "../client";
import { RoleAction } from "../commands/enums";
import { visitorRole } from "../utils";

export const guildMemberAddHandler = async (member: GuildMember) => {
  await visitorRole({
    action: RoleAction.get,
    userId: member.user.id,
  });

  const introductionsChannel = discord.channel("introductions");
  const introductionsChannelMention = introductionsChannel
    ? channelMention(introductionsChannel.id)
    : "#introductions";

  const welcomeMessage = [
    `Welcome to Component Factory, ${userMention(member.user.id)}! 🎉\n`,
    `Please take a moment to introduce yourself in ${introductionsChannelMention}.`,
    "We'd love to hear how you found us and what project you're currently working on.\n",
    "Use the /roles command to choose your roles and gain access to specific channels.",
  ];

  await discord.channel("welcome")?.send({
    content: welcomeMessage.join("\n"),
  });
};

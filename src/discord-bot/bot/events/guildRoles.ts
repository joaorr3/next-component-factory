import type Discord from "discord.js";
import prisma from "../../data";
import discord from "../client";

type GuildRolesEventType = "create" | "delete" | "update";

export const guildRolesHandler = async (
  eventType: GuildRolesEventType,
  role: Discord.Role
) => {
  const r = await discord.guild?.roles.fetch(role.id);
  const roleName = r?.name || role.name;

  switch (eventType) {
    case "create":
      await prisma.roles.create({
        id: role.id,
        name: roleName,
        isAutoAssignable: false,
      });
      break;
    case "delete":
      await prisma.roles.delete(role.id);
      break;
    case "update":
      await prisma.roles.update({ name: roleName }, role.id);
      break;
  }
};

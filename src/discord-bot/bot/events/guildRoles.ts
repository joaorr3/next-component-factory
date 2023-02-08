import type { GuildRole } from "@prisma/client";
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

  const genericGuildRole: GuildRole = {
    id: role.id,
    name: roleName,
    isAutoAssignable: false,
  };

  switch (eventType) {
    case "create":
      await prisma.roles.create(genericGuildRole);
      break;
    case "delete":
      await prisma.roles.delete(genericGuildRole.id);
      break;
    case "update":
      await prisma.roles.update(genericGuildRole, genericGuildRole.id);
      break;
  }
};

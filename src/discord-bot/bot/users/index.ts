import type Discord from "discord.js";

export const getUserById = (guild: Discord.Guild, id: string) => {
  return guild.members.cache.find((m) => m.id === id);
};

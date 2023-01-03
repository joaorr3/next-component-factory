import Discord from "discord.js";

export const Embed = (info: Discord.EmbedData) => {
  return new Discord.EmbedBuilder(info).setColor("Gold").setTimestamp();
};

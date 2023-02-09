import Discord from "discord.js";
import logger from "../../shared/logger";
import discord from "./client";
import { registerCommands } from "./commands";
import {
  guildMemberAddHandler,
  guildMemberUpdateHandler,
  interactionCreateHandler,
} from "./events";
import { guildRolesHandler } from "./events/guildRoles";
import { BotLog } from "./utils";

export const initializeBot = () => {
  discord.client?.once(Discord.Events.ClientReady, async () => {
    logger.console.discord({ level: "info", message: "Ready" });

    BotLog.log(() => {
      return {
        embeds: [
          discord.embed({
            title: "I'm ready! [Next]",
          }),
        ],
      };
    });

    registerCommands();
  });

  discord.on(Discord.Events.InteractionCreate, interactionCreateHandler);
  discord.on(Discord.Events.GuildMemberAdd, guildMemberAddHandler);
  discord.on(Discord.Events.GuildMemberUpdate, guildMemberUpdateHandler);

  discord.on(Discord.Events.GuildRoleCreate, async (role) => {
    await guildRolesHandler("create", role);
  });
  discord.on(Discord.Events.GuildRoleDelete, async (role) => {
    await guildRolesHandler("delete", role);
  });
  discord.on(Discord.Events.GuildRoleUpdate, async (role) => {
    await guildRolesHandler("update", role);
  });
};

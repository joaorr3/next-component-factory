import Discord from "discord.js";
import logger from "../../shared/logger";
import discord from "./client";
import { registerCommands } from "./commands";
import {
  guildMemberAddHandler,
  guildMemberUpdateHandler,
  interactionCreateHandler,
} from "./events";
import { channelUpdateHandler } from "./events/channelUpdate";
import { guildRolesHandler } from "./events/guildRoles";
import { BotLog } from "./utils";
import AzureDiscord from "../azure/controllers/discord";
import AzureMail from "../azure/controllers/mail";
import PullRequestController from "../azure/controllers/pullRequests";
import { helpConstants } from "./constants";
import { checkThreadGuidelines } from "./utils/help";

export const initializeBot = () => {
  discord.client?.once(Discord.Events.ClientReady, async () => {
    logger.console.discord({ level: "info", message: "Ready" });

    const azureDiscord = new AzureDiscord(discord.client);
    const azureMail = new AzureMail({ autoReconnect: true });

    azureMail.on("error", async (error) => {
      BotLog.log(() => {
        return {
          embeds: [
            discord.embed({
              title: `[AzureMail] Error: ${error.message}`,
            }),
          ],
        };
      });
    });

    azureMail.on("mail", async (mail) => {
      const updatedPr = await PullRequestController.processMail(mail);
      await azureDiscord.processMail(mail, updatedPr);
    });

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
  discord.on(Discord.Events.ChannelUpdate, async (channel) => {
    if (channel.type === Discord.ChannelType.GuildText) {
      await channelUpdateHandler(channel);
    }
  });
  discord.on(Discord.Events.ThreadCreate, async (thread) => {
    if (thread?.parent?.name === helpConstants.name) {
      await checkThreadGuidelines(thread);
    }
  });
};

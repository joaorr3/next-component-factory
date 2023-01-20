import Discord, {
  codeBlock,
  GatewayIntentBits,
  Partials,
  userMention,
} from "discord.js";
import { env } from "../../env/server";
import { parseKudos } from "../../shared/dataUtils";
import { WebhookType } from "../../shared/webhookType";
import type { startPrisma } from "../data";
import { notionBatchUpdate, transformGuildMemberData } from "../data/utils";
import type { startNotion } from "../notion";
import { logInteraction, sleep } from "../utils";
import { logger } from "../utils/logger";
import { getTextChannel } from "./channels";
import { commandReactions, registerCommands } from "./commands";
import { RoleAction } from "./commands/enums";
import { Embed } from "./messages";
import type { CommandName } from "./types";
import { getUserById } from "./users";
import { BotLog, getGuild, visitorRole } from "./utils";

export const startBot = ({
  notionActions,
  prismaActions,
}: {
  notionActions?: ReturnType<typeof startNotion>;
  prismaActions?: ReturnType<typeof startPrisma>;
}) => {
  if (env.DISCORD_BOT_TOKEN) {
    const client = new Discord.Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildWebhooks,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    });

    client.once(Discord.Events.ClientReady, async () => {
      logger.console.discord({ level: "info", message: "Ready" });

      const guild = getGuild(client);

      if (guild) {
        BotLog.log(guild, () => {
          return {
            embeds: [
              Embed({
                title: "I'm ready! [Next]",
              }),
            ],
          };
        });

        registerCommands();
      }
    });

    client.on(Discord.Events.InteractionCreate, async (interaction) => {
      if (interaction.isChatInputCommand()) {
        const commandName = interaction.commandName as CommandName;

        const commandResponse = await commandReactions({
          commandName,
          client,
          interaction,
        });

        logInteraction({
          client,
          commandName,
          interaction,
          commandResponse,
        });

        if (commandResponse) {
          const { name, response } = commandResponse;

          switch (name) {
            case "issue": {
              const { hasLabRole, thread, issueDetails } = response;

              if (hasLabRole && thread && issueDetails.title) {
                const page_id = await notionActions?.addIssue(issueDetails);

                const issueMapping = await prismaActions?.createIssueMapping({
                  notion_page_id: page_id || null,
                  discord_thread_id: thread.id || null,
                  author: issueDetails.author,
                  title: issueDetails.title,
                });

                await prismaActions?.createIssue({
                  issueIdMappingId: issueMapping?.id ?? -1,
                  ...issueDetails,
                });

                if (page_id) {
                  const pageUrl = await notionActions?.getPageUrl(page_id);

                  await thread?.send({
                    content: pageUrl,
                  });
                }
              }

              break;
            }
            case "archive": {
              const pageId = await prismaActions?.getNotionPageByThreadId({
                discord_thread_id: response.threadId ?? null,
              });

              logger.db.discord({
                level: "info",
                message: `Archiving thread ${response.threadId}`,
              });

              if (pageId) {
                const issue = await prismaActions?.getIssueDetailsByThreadId({
                  discord_thread_id: response.threadId ?? null,
                });

                if (issue) {
                  await prismaActions?.updateIssue({
                    id: issue?.id,
                    property: "status",
                    value: "DONE",
                  });
                }

                await notionActions?.updatePageStatus(pageId, "DONE");

                logger.db.notion({
                  level: "info",
                  message: `Updating Notion Page: [${pageId}]`,
                });
              }
              break;
            }
            case "assign": {
              const { thread, user, assignee } = response;

              const pageId = await prismaActions?.getNotionPageByThreadId({
                discord_thread_id: thread?.id || null,
              });

              const notionUserId =
                await prismaActions?.getNotionUserIdByGuildUserId(
                  assignee?.id || user.id
                );

              if (pageId && notionUserId) {
                await notionActions?.updateAssignTo({
                  pageId,
                  userId: notionUserId,
                });
                logger.db.notion({
                  level: "info",
                  message: `Assigned issue ${pageId} to ${notionUserId}`,
                });
              } else {
                await thread?.send({
                  content: "Sorry, can't find any info about this issue.",
                });
                logger.db.notion({
                  level: "error",
                  message: `Could not assign issue: ${pageId} to ${notionUserId}`,
                });
              }

              break;
            }
            case "notion_batch_update": {
              const { isAllowed, start_date, end_date } = response;

              logger.db.discord({
                level: "info",
                message: `start_date: ${start_date} | end_date: ${end_date}`,
              });

              if (isAllowed && start_date && end_date) {
                notionBatchUpdate(
                  {
                    start_date,
                    end_date,
                  },
                  {
                    prisma: prismaActions,
                    notion: notionActions,
                  }
                );
              }

              break;
            }
            case "kudos": {
              const { from, to, type } = response;
              await prismaActions?.saveKudos({
                fromId: from.id,
                toId: to.id,
                type,
              });
              break;
            }
            case "list_kudos": {
              const { channel } = response;

              const kudos = await prismaActions?.getKudos();
              const parsed = parseKudos(kudos);

              const textArray: string[] = [];

              parsed.forEach((data) => {
                textArray.push(`${data.user.name}\n`);
                Object.entries(data.kudos).forEach(([k, v]) => {
                  textArray.push(` > ${k}: ${v}\n`);
                });
                textArray.push("\n");
              });

              channel?.send({
                content: codeBlock(textArray.join("")),
              });
              break;
            }
            case "sync_guild_users": {
              const { guildUsers } = response;

              for (const guildUser of guildUsers) {
                await prismaActions?.updateGuildUser(guildUser);
                await sleep(200);
              }

              break;
            }
          }
        }
      }
    });

    client.on(Discord.Events.GuildMemberAdd, async (member) => {
      const guild = getGuild(client);
      if (guild) {
        const welcomeChannel = getTextChannel(guild, {
          name: "welcome",
        });

        await welcomeChannel?.send({
          content: `What's up ${userMention(
            member.user.id
          )}? Ask me for roles. /roles`,
        });

        await visitorRole({
          action: RoleAction.give,
          userId: member.user.id,
          guild,
        });
      }
    });

    client.on(Discord.Events.GuildMemberUpdate, async (member) => {
      try {
        const cachedGuildMember = getUserById(member.guild, member.id);
        if (cachedGuildMember) {
          const guildMember = await cachedGuildMember.fetch();
          const guildUser = transformGuildMemberData(guildMember);
          const response = await prismaActions?.updateGuildUser(guildUser);
          if (response) {
            logger.db.discord({
              level: "info",
              message: `[GuildMemberUpdate(${
                response.action
              })] -> ${JSON.stringify(response.guildUser)}`,
            });
          }
        }
      } catch (error) {
        logger.db.discord({
          level: "error",
          message: `[GuildMemberUpdate] -> ${JSON.stringify(error)}`,
        });
      }
    });

    client.on(Discord.Events.MessageCreate, async (message) => {
      try {
        const guild = message.guild;
        if (guild) {
          if (message.webhookId) {
            const whs = await guild?.fetchWebhooks();
            const c18_wh = whs?.find(
              (wh) => wh.id === env.DISCORD_WEBHOOK_C18_ID
            );
            const wh_message = await c18_wh?.fetchMessage(message.id);

            if (c18_wh && wh_message) {
              console.log("message: ", JSON.stringify(message));
              // message from a webhook
              switch (wh_message.content) {
                case WebhookType.BUILD:
                  BotLog.buildLog(guild, () => {
                    return { embeds: wh_message.embeds };
                  });
                  break;
                case WebhookType.PR:
                  BotLog.prLog(guild, () => {
                    return { embeds: wh_message.embeds };
                  });
                  break;
                case WebhookType.WORK_ITEM:
                  BotLog.workItemLog(guild, () => {
                    return { embeds: wh_message.embeds };
                  });
                  break;
              }
            }
          }
        }
      } catch (error) {
        logger.db.discord({
          level: "error",
          message: `MessageCreate: ${error}`,
        });
      }
    });

    client.login(env.DISCORD_BOT_TOKEN);
  }
};

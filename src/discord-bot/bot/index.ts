import Discord, {
  codeBlock,
  FormattingPatterns,
  GatewayIntentBits,
  Partials,
  userMention,
} from "discord.js";
import { parseKudos } from "../../shared/dataUtils";
import type { startPrisma } from "../data";
import { notionBatchUpdate } from "../data/utils";
import type { startNotion } from "../notion";
import { config, logInteraction, sleep } from "../utils";
import { logger } from "../utils/logger";
import { getTextChannel, getThreadChannel } from "./channels";
import { commandReactions, registerCommands } from "./commands";
import { RoleAction } from "./commands/enums";
import { Emojis, GuildChannelName, GuildRoles } from "./constants";
import { Embed } from "./messages";
import { hasRoleByName } from "./roles";
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
  const { DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID } = config();

  if (DISCORD_BOT_TOKEN) {
    const client = new Discord.Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [Partials.Message, Partials.Channel, Partials.Reaction],
    });

    client.once(Discord.Events.ClientReady, () => {
      logger.console.discord({ level: "info", message: "Ready" });

      const guild = getGuild(client);

      if (guild) {
        BotLog.log(guild, () => {
          return Embed({
            title: "I'm ready! [Next]",
          });
        });

        registerCommands({
          DISCORD_CLIENT_ID,
          DISCORD_BOT_TOKEN,
          GUILD_ID: guild.id,
        });
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

              if (pageId) {
                logger.db.discord({
                  level: "info",
                  message: `Updating page: [${pageId}] status using db. :)`,
                });
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
              } else {
                logger.db.discord({
                  level: "info",
                  message: `Force updating page: [${pageId}] status. :(`,
                });
                await notionActions?.forceUpdatePageStatus(
                  response.threadId,
                  "DONE"
                );
              }
              break;
            }
            case "open": {
              const { thread } = response;

              const issueDetails =
                await prismaActions?.getIssueDetailsByThreadId({
                  discord_thread_id: thread?.id || null,
                });

              if (!issueDetails) {
                await thread?.send({
                  content: "Sorry, can't find any info about this issue.",
                });
                logger.db.discord({
                  level: "info",
                  message: `ThreadID: ${thread?.id} | issue details not found`,
                });
              }

              logger.console.discord({
                level: "info",
                message: `Issue Details: ${issueDetails?.title} - ${issueDetails?.author}`,
              });

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

    client.on(
      Discord.Events.MessageReactionAdd,
      async ({ message, emoji }, user) => {
        const guild = getGuild(client);

        if (guild) {
          const issueTrackingChannel = getTextChannel(guild, {
            name: GuildChannelName.issueTracking,
          });

          const guildUser = getUserById(guild, user.id);
          const hasDevRole = hasRoleByName(guildUser, GuildRoles.dev);

          const reactionMessage = message.partial
            ? await message.fetch()
            : message;

          if (
            reactionMessage.channelId === issueTrackingChannel?.id &&
            guildUser &&
            hasDevRole
          ) {
            try {
              const threadMention = reactionMessage.embeds[0]?.fields[0]?.value;

              const channelRegEx = new RegExp(FormattingPatterns.Channel, "g");
              const parsedChannel = threadMention?.matchAll(channelRegEx).next()
                .value as string[];
              const channelId = parsedChannel[1] ?? undefined;

              const guildThread = getThreadChannel(guild, { id: channelId });

              switch (emoji.name) {
                case Emojis.check:
                  await guildThread?.send({
                    content: `${userMention(
                      guildUser?.id
                    )} has marked this issue as resolved.`,
                  });

                  await guildThread?.send({
                    content: "This thread will be auto archived in 1 hour.",
                  });

                  guildThread?.setAutoArchiveDuration(
                    Discord.ThreadAutoArchiveDuration.OneHour
                  );

                  break;
                case Emojis.eyes:
                  await guildThread?.send({
                    content: `${userMention(
                      guildUser?.id
                    )} has seen this issue.`,
                  });
                  break;
                case Emojis.question:
                  await guildThread?.send({
                    content: `${userMention(
                      guildUser?.id
                    )} has some questions on this issue.`,
                  });
                  break;
                case Emojis.inprogress:
                  await guildThread?.send({
                    content: `${userMention(
                      guildUser?.id
                    )} has started working on this issue.`,
                  });
                  break;
                case Emojis.one:
                case Emojis.two:
                case Emojis.three:
                case Emojis.four:
                case Emojis.five:
                case Emojis.six:
                case Emojis.seven:
                case Emojis.eight:
                  await guildThread?.send({
                    content: `${userMention(
                      guildUser?.id
                    )} gave an estimation of ${emoji.name} hours.`,
                  });
                  break;
              }
            } catch (error) {
              console.error(
                "Catch: Discord.Events.MessageReactionAdd: ",
                error
              );
            }
          }
        }
      }
    );

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

    client.login(DISCORD_BOT_TOKEN);
  }
};

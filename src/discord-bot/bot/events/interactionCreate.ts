import { codeBlock, type CacheType, type Interaction } from "discord.js";
import { parseKudos } from "../../../shared/dataUtils";
import prisma, { DataUtils } from "../../data";
import logger from "../../../shared/logger";
import { logInteraction } from "../utils/logs";
import { commandReactions } from "../commands";
import { type CommandName } from "../types";
import { wait } from "../../../shared/utils";
import notion from "../../../shared/notion";

export const interactionCreateHandler = async (
  interaction: Interaction<CacheType>
) => {
  if (interaction.isChatInputCommand()) {
    const commandName = interaction.commandName as CommandName;

    const client = interaction.client;

    const commandResponse = await commandReactions({
      commandName,
      client,
      interaction,
    });

    logInteraction({
      commandName,
      interaction,
      commandResponse,
    });

    if (commandResponse) {
      const { name, response } = commandResponse;

      switch (name) {
        //region Issue
        case "issue": {
          const { hasLabRole, thread, issueDetails } = response;

          if (hasLabRole && thread && issueDetails.title) {
            const page_id = await notion?.addIssue(issueDetails);

            const issueMapping = await prisma?.issues.createIssueMapping({
              notion_page_id: page_id || null,
              discord_thread_id: thread.id || null,
              author: issueDetails.author,
              title: issueDetails.title,
            });

            await prisma?.issues.createIssue({
              issueIdMappingId: issueMapping?.id ?? -1,
              ...issueDetails,
            });

            if (page_id) {
              const pageUrl = await notion?.getPageUrl(page_id);

              await thread?.send({
                content: pageUrl,
              });
            }
          }

          break;
        }
        //endregion

        //region Archive
        case "archive": {
          const pageId = await prisma?.issues.getNotionPageByThreadId({
            discord_thread_id: response.threadId ?? null,
          });

          logger.db.discord({
            level: "info",
            message: `Archiving thread ${response.threadId}`,
          });

          if (pageId) {
            const issue = await prisma?.issues.getIssueDetailsByThreadId({
              discord_thread_id: response.threadId ?? null,
            });

            if (issue) {
              await prisma?.issues.updateIssue({
                id: issue?.id,
                property: "status",
                value: "DONE",
              });
            }

            await notion?.updatePageStatus(pageId, "DONE");

            logger.db.notion({
              level: "info",
              message: `Updating Notion Page: [${pageId}]`,
            });
          }
          break;
        }
        //endregion

        //region Assign
        case "assign": {
          const { thread, user, assignee } = response;

          const pageId = await prisma?.issues.getNotionPageByThreadId({
            discord_thread_id: thread?.id || null,
          });

          const notionUserId =
            await prisma?.guildUser.getNotionUserIdByGuildUserId(
              assignee?.id || user.id
            );

          if (pageId && notionUserId) {
            await notion?.updateAssignTo({
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
        //endregion

        //region Notion Batch Update
        case "notion_batch_update": {
          const { isAllowed, start_date, end_date } = response;

          logger.db.discord({
            level: "info",
            message: `start_date: ${start_date} | end_date: ${end_date}`,
          });

          if (isAllowed && start_date && end_date) {
            DataUtils.notionBatchUpdate({
              start_date,
              end_date,
            });
          }

          break;
        }
        //endregion

        //region Kudos
        case "kudos": {
          const { from, to, type } = response;
          await prisma?.kudos.saveKudos({
            fromId: from.id,
            toId: to.id,
            type,
          });
          break;
        }
        //endregion

        //region ListKudos
        case "list_kudos": {
          const { channel } = response;

          const kudos = await prisma?.kudos.getKudos();
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
        //endregion

        //region Sync Guild Users
        case "sync_guild_users": {
          const { guildUsers } = response;

          for (const guildUser of guildUsers) {
            await prisma?.guildUser.updateGuildUser(guildUser);
            await wait(200);
          }

          break;
        }
        //endregion
      }
    }
  }
};

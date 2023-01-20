import { type GuildUser } from "@prisma/client";
import { type GuildMember } from "discord.js";
import type { startPrisma } from "../data";
import type { startNotion } from "../notion";
import { sleep } from "../utils";
import { logger } from "../utils/logger";

export const notionBatchUpdate = async (
  range: { start_date: string; end_date: string },
  actions: {
    notion?: ReturnType<typeof startNotion>;
    prisma?: ReturnType<typeof startPrisma>;
  }
) => {
  const issuesToBatch = await actions.prisma?.getIssuesToBatch(
    range.start_date,
    range.end_date
  );

  logger.db.discord({
    level: "info",
    message: `${issuesToBatch?.length} will be updated`,
  });

  if (issuesToBatch) {
    for (const { id, Issue } of issuesToBatch) {
      logger.console.notion({
        level: "info",
        message: `Updating issue [${id}]: ${Issue?.title}`,
      });
      const pageId = await actions.notion?.addIssue({
        title: Issue?.title || "",
        description: Issue?.description || "",
        lab: Issue?.lab || "",
        author: Issue?.author || "",
        status: "TODO",
        discordThreadId: Issue?.discordThreadId || "",
        version: Issue?.version || "",
        type: Issue?.type || "",
        stepsToReproduce: Issue?.stepsToReproduce || "",
        component: Issue?.component || "",
        severity: Issue?.severity || "",
        specs: Issue?.specs || "",
        codeSnippet: Issue?.codeSnippet || "",
        checkTechLead: Issue?.checkTechLead || false,
        checkDesign: Issue?.checkDesign || false,
        scope: Issue?.scope || "",
        attachment: Issue?.attachment || "",
        attachment2: Issue?.attachment2 || "",
        azureWorkItem: Issue?.azureWorkItem || "",
        createdAt: new Date(),
      });
      await sleep(200);
      await actions.prisma?.updateIssueMapping(id, pageId);
      await sleep(200);
    }
  }
};

export const notionSyncCreatedDate = async (
  range: { start_date: string; end_date: string },
  actions: {
    notion?: ReturnType<typeof startNotion>;
    prisma?: ReturnType<typeof startPrisma>;
  }
) => {
  const issuesToUpdate = await actions.prisma?.getRangeIssues(
    range.start_date,
    range.end_date
  );

  logger.console.discord({
    level: "info",
    message: `${issuesToUpdate?.length} will be updated`,
  });

  if (issuesToUpdate) {
    for (const { id, notion_page_id, Issue } of issuesToUpdate) {
      logger.console.notion({
        level: "info",
        message: `Updating Notion [${id}]: ${Issue?.title}`,
      });
      await actions.notion?.updateCreatedAt(notion_page_id, Issue?.createdAt);
      await sleep(200);
    }
  }
};

export const transformGuildMemberData = (member: GuildMember): GuildUser => {
  const { id, user, displayName, roles, displayHexColor } = member;

  return {
    id,
    isBot: user.bot,
    username: user.username,
    friendlyName: displayName,
    color: displayHexColor,
    roles: JSON.stringify(
      roles.cache.map(({ id, name, hexColor }) => ({
        id,
        name,
        hexColor,
      }))
    ),
    avatarURL: user.avatarURL({ extension: "png" }),
    notionUserId: null,
    azureUserId: null,
  };
};

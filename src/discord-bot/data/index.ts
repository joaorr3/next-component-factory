import type { GuildUser, Issue, IssueIdMapping, Kudos } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import dayjs from "dayjs";

import customParseFormat from "dayjs/plugin/customParseFormat";
import { sleep } from "../utils";
dayjs.extend(customParseFormat);

export const prisma = new PrismaClient();

export const startPrisma = ({ start }: { start: boolean }) => {
  if (!start) return;

  if (prisma) {
    console.log("Prisma: ready");
  }

  const createIssue = async (issue: Omit<Issue, "id" | "timestamp">) => {
    try {
      return await prisma.issue.create({
        data: issue,
      });
    } catch (error) {
      console.log("prisma:error:createIssue: ", error);
    }
  };

  const updateIssue = async <K extends keyof Issue>({
    id,
    property,
    value,
  }: {
    id: number;
    property: K;
    value: Issue[K];
  }) => {
    try {
      return await prisma.issue.update({
        where: {
          id,
        },
        data: {
          [property]: value,
        },
      });
    } catch (error) {
      console.log("prisma:error:updateIssue: ", error);
    }
  };

  const createIssueMapping = async ({
    notion_page_id,
    discord_thread_id,
    author,
    title,
  }: Pick<
    IssueIdMapping,
    "notion_page_id" | "discord_thread_id" | "author" | "title"
  >) => {
    try {
      return await prisma.issueIdMapping.create({
        data: {
          notion_page_id,
          discord_thread_id,
          author,
          title,
        },
      });
    } catch (error) {
      console.log("prisma:error:createIssueMapping: ", error);
    }
  };

  const updateIssueMapping = async (id: number, notionPageId?: string) => {
    try {
      if (notionPageId) {
        return await prisma.issueIdMapping.update({
          where: {
            id,
          },
          data: {
            notion_page_id: notionPageId,
          },
        });
      }
    } catch (error) {
      console.log("prisma:error:createIssueMapping: ", error);
    }
  };

  const getNotionPageByThreadId = async ({
    discord_thread_id,
  }: Pick<IssueIdMapping, "discord_thread_id">) => {
    try {
      const issue = await prisma.issueIdMapping.findFirst({
        where: {
          discord_thread_id,
        },
      });
      return issue?.notion_page_id;
    } catch (error) {
      console.log("prisma:error:getNotionPageByThreadId: ", error);
    }
  };

  const getIssueDetailsByThreadId = async ({
    discord_thread_id,
  }: Pick<IssueIdMapping, "discord_thread_id">) => {
    try {
      const issueIdMapping = await prisma.issueIdMapping.findFirst({
        where: {
          discord_thread_id,
        },
        select: {
          Issue: true,
        },
      });
      return issueIdMapping?.Issue;
    } catch (error) {
      console.log("prisma:error:getIssueDetailsByThreadId: ", error);
    }
  };

  const getIssuesToBatch = async (_startDate: string, _endDate: string) => {
    const startDate = dayjs(_startDate, "DD/MM/YYYY", true).toDate();
    const endDate = dayjs(_endDate, "DD/MM/YYYY", true).toDate();

    const issues = await prisma.issueIdMapping.findMany({
      where: {
        AND: [
          {
            notion_page_id: null,
          },
          {
            createdAt: {
              gte: startDate,
            },
          },
          {
            createdAt: {
              lte: endDate,
            },
          },
        ],
      },
      include: {
        Issue: true,
      },
    });

    return issues
      .map(({ id, Issue }) => ({
        id,
        Issue,
      }))
      .filter(
        ({ Issue }) =>
          Issue !== null &&
          Issue.lab !== "tests" &&
          Issue.author !== "joaoribeiro"
      );
  };

  const getRangeIssues = async (_startDate: string, _endDate: string) => {
    const startDate = dayjs(_startDate, "DD/MM/YYYY", true).toDate();
    const endDate = dayjs(_endDate, "DD/MM/YYYY", true).toDate();

    const issues = await prisma.issueIdMapping.findMany({
      where: {
        AND: [
          {
            createdAt: {
              gte: startDate,
            },
          },
          {
            createdAt: {
              lte: endDate,
            },
          },
        ],
      },
      include: {
        Issue: true,
      },
    });

    return issues
      .map(({ id, notion_page_id, Issue }) => ({
        id,
        notion_page_id,
        Issue,
      }))
      .filter(
        ({ Issue }) =>
          Issue !== null &&
          Issue.lab !== "tests" &&
          Issue.author !== "joaoribeiro"
      );
  };

  const saveKudos = async (data: Omit<Kudos, "id" | "timestamp">) => {
    try {
      return await prisma.kudos.create({
        data,
      });
    } catch (error) {
      console.log("prisma:error:saveKudos: ", error);
    }
  };

  const getKudos = async () => {
    try {
      return await prisma.kudos.findMany({
        include: {
          to: true,
        },
      });
    } catch (error) {
      console.log("prisma:error:getKudos: ", error);
    }
  };

  const updateGuildUser = async (data: GuildUser) => {
    try {
      const user = await prisma.guildUser.findFirst({
        where: {
          id: data.id,
        },
      });
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { notionUserId, id, azureUserId, ...restData } = data;
        const guildUser = await prisma.guildUser.update({
          where: {
            id: user.id,
          },
          data: restData,
        });

        return {
          action: "updated",
          guildUser,
        } as const;
      } else {
        const guildUser = await prisma.guildUser.create({
          data,
        });

        return {
          action: "created",
          guildUser,
        } as const;
      }
    } catch (error) {
      console.log("prisma:error:updateGuildUser: ", error);
    }
  };

  const replicateIssueTimestamp = async () => {
    try {
      const allIssues = await prisma.issue.findMany();

      for (const { id, timestamp } of allIssues) {
        await prisma.issue.update({
          where: {
            id,
          },
          data: {
            createdAt: timestamp,
          },
        });
        await sleep(200);
      }
    } catch (error) {
      console.log("prisma:error:replicateIssueTimestamp: ", error);
    }
  };

  const getNotionUserIdByGuildUserId = async (userId: string) => {
    try {
      const user = await prisma.guildUser.findUnique({
        where: {
          id: userId,
        },
        include: {
          notionUser: true,
        },
      });

      if (user) {
        return user.notionUser?.notionUserId;
      }

      return undefined;
    } catch (error) {
      console.log("prisma:error:getGuildUser: ", error);
    }
  };

  return {
    createIssue,
    updateIssue,
    createIssueMapping,
    getNotionPageByThreadId,
    getIssueDetailsByThreadId,
    getIssuesToBatch,
    getRangeIssues,
    updateIssueMapping,
    saveKudos,
    getKudos,
    updateGuildUser,
    replicateIssueTimestamp,
    getNotionUserIdByGuildUserId,
  };
};

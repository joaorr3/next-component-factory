import type { PrismaClient } from "@prisma/client";
import { type Issue, type IssueIdMapping } from "@prisma/client";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { wait } from "../../utils";

export class IssuesManager {
  private client: PrismaClient;
  constructor(_client: PrismaClient) {
    this.client = _client;
    dayjs.extend(customParseFormat);
  }

  async createIssue(issue: Omit<Issue, "id" | "timestamp" | "platform">) {
    try {
      return await this.client.issue.create({
        data: issue,
      });
    } catch (error) {
      console.log("prisma:error:createIssue: ", error);
    }
  }

  async updateIssue<K extends keyof Issue>({
    id,
    property,
    value,
  }: {
    id: number;
    property: K;
    value: Issue[K];
  }) {
    try {
      return await this.client.issue.update({
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
  }

  async createIssueMapping({
    notion_page_id,
    discord_thread_id,
    author,
    title,
  }: Pick<
    IssueIdMapping,
    "notion_page_id" | "discord_thread_id" | "author" | "title"
  >) {
    try {
      return await this.client.issueIdMapping.create({
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
  }

  async updateIssueMapping(id: number, notionPageId?: string) {
    try {
      if (notionPageId) {
        return await this.client.issueIdMapping.update({
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
  }

  async getNotionPageByThreadId({
    discord_thread_id,
  }: Pick<IssueIdMapping, "discord_thread_id">) {
    try {
      const issue = await this.client.issueIdMapping.findFirst({
        where: {
          discord_thread_id,
        },
      });
      return issue?.notion_page_id;
    } catch (error) {
      console.log("prisma:error:getNotionPageByThreadId: ", error);
    }
  }

  async getIssueDetailsByThreadId({
    discord_thread_id,
  }: Pick<IssueIdMapping, "discord_thread_id">) {
    try {
      const issueIdMapping = await this.client.issueIdMapping.findFirst({
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
  }

  async getIssuesToBatch(_startDate: string, _endDate: string) {
    const startDate = dayjs(_startDate, "DD/MM/YYYY", true).toDate();
    const endDate = dayjs(_endDate, "DD/MM/YYYY", true).toDate();

    const issues = await this.client.issueIdMapping.findMany({
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
  }

  async getRangeIssues(_startDate: string, _endDate: string) {
    const startDate = dayjs(_startDate, "DD/MM/YYYY", true).toDate();
    const endDate = dayjs(_endDate, "DD/MM/YYYY", true).toDate();

    const issues = await this.client.issueIdMapping.findMany({
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
  }

  async replicateIssueTimestamp() {
    try {
      const allIssues = await this.client.issue.findMany();

      for (const { id, timestamp } of allIssues) {
        await this.client.issue.update({
          where: {
            id,
          },
          data: {
            createdAt: timestamp,
          },
        });
        await wait(200);
      }
    } catch (error) {
      console.log("prisma:error:replicateIssueTimestamp: ", error);
    }
  }
}

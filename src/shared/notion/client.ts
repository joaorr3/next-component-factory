import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { env } from "../../env/server";
import { c18Avatar } from "../dataUtils";
import logger from "../logger";
import type { IssueDetailsModel } from "../models";

import {
  bookmark,
  checkBox,
  getPublicUrl,
  image,
  paragraph,
  parseToNumberedList,
  scopeToLabel,
  severityLevelToEmoji,
  spacer,
  guildChannelUrl,
} from "./utils";

class Notion {
  public client: Client;

  private static _instance: Notion = new Notion();

  private constructor() {
    this.client = new Client({
      auth: env.NOTION_TOKEN,
    });
  }

  public static get Instance(): Notion {
    return this._instance;
  }

  async addIssue({
    title,
    description,
    lab,
    author,
    status = "TODO",
    discordThreadId,
    version,
    type,
    stepsToReproduce,
    component,
    severity,
    specs,
    codeSnippet,
    checkTechLead,
    checkDesign,
    scope,
    attachment,
    attachment2,
    createdAt,
  }: IssueDetailsModel) {
    try {
      const res = await this.client.pages.create({
        parent: {
          type: "database_id",
          database_id: env.NOTION_ISSUES_DB_ID,
        },
        icon: {
          type: "external",
          external: {
            url: c18Avatar,
          },
        },
        children: [
          paragraph(`Component: ${component}`),
          ...spacer(),

          paragraph(`Severity: ${severityLevelToEmoji(severity)}`),
          ...spacer(),

          paragraph(`Scope: ${scopeToLabel(scope)}`),
          ...spacer(),

          // Description (Quote)
          {
            type: "quote",
            quote: {
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: description ?? "",
                  },
                  annotations: {
                    italic: true,
                  },
                },
              ],
            },
          },
          ...spacer(),
          // Steps to reproduce (Numbered List)
          ...parseToNumberedList(stepsToReproduce),
          ...spacer(2),

          // Specs (Bookmark)
          bookmark(specs, "Specs"),
          ...spacer(),

          // CodeSnippet (Bookmark)
          bookmark(codeSnippet, "Code Snippet"),
          ...spacer(),
          // Discord Thread (Bookmark)
          bookmark(guildChannelUrl(discordThreadId || ""), "Discord Thread"),
          ...spacer(),

          checkBox(checkTechLead, "Check with TechLead"),
          checkBox(checkDesign, "Check with Design"),
          ...spacer(),
          image(attachment, "Attachment"),
          image(attachment2, "Attachment2"),
          ...spacer(),
          {
            type: "divider",
            divider: {},
          },
          paragraph("Created by C18"),
        ],
        properties: {
          discord_id: {
            rich_text: [
              { type: "text", text: { content: discordThreadId || "" } },
            ],
          },
          title: {
            title: [{ type: "text", text: { content: title || "" } }],
          },
          LAB: {
            multi_select: [
              {
                name: lab || "",
              },
            ],
          },
          Status: {
            select: {
              name: status,
            },
          },
          Type: {
            select: {
              name: type || "",
            },
          },
          "Person Requesting": {
            rich_text: [{ type: "text", text: { content: author || "" } }],
          },
          Origin: {
            multi_select: [
              {
                name: "Discord",
              },
            ],
          },
          Version: {
            rich_text: [{ type: "text", text: { content: version || "" } }],
          },
          CreatedAt: {
            type: "date",
            date: {
              start: createdAt?.toISOString() || new Date().toISOString(),
            },
          },
        },
      });

      logger.db.notion({
        level: "info",
        message: `AddIssue: ${res.id}`,
      });
      return res.id;
    } catch (error) {
      logger.db.notion({
        level: "error",
        message: `addIssue: ${error}`,
      });
    }
  }

  async getPageUrl(pageId: string) {
    try {
      if (!pageId) {
        throw Error("Issue not found");
      }

      const res = (await this.client.pages.retrieve({
        page_id: pageId,
      })) as PageObjectResponse;

      return getPublicUrl(res.url);
    } catch (error) {
      logger.db.notion({
        level: "error",
        message: `getPageUrl: ${error}`,
      });
    }
  }

  async updatePageStatus(
    pageId?: string,
    status: IssueDetailsModel["status"] = "TODO"
  ) {
    try {
      if (pageId) {
        await this.client.pages.update({
          page_id: pageId,
          properties: {
            Status: {
              select: {
                name: status,
              },
            },
          },
        });
      }
    } catch (error) {
      logger.db.notion({
        level: "error",
        message: `updatePageStatus: ${error}`,
      });
    }
  }

  async updateCreatedAt(pageId?: string | null, createdAt?: Date | null) {
    try {
      if (pageId && createdAt) {
        await this.client.pages.update({
          page_id: pageId,
          properties: {
            CreatedAt: {
              type: "date",
              date: {
                start: createdAt.toISOString(),
              },
            },
          },
        });
      }
    } catch (error) {
      logger.db.notion({
        level: "error",
        message: `updateCreatedAt: ${error}`,
      });
    }
  }

  async updatePageExternalIcon(pageId?: string | null, iconUrl?: string) {
    try {
      if (pageId) {
        await this.client.pages.update({
          page_id: pageId,
          icon: {
            type: "external",
            external: {
              url: iconUrl || c18Avatar,
            },
          },
        });
      }
    } catch (error) {
      logger.db.notion({
        level: "error",
        message: `updatePageExternalIcon: ${error}`,
      });
    }
  }

  async updateAssignTo({
    pageId,
    userId,
  }: {
    pageId?: string;
    userId?: string;
  }) {
    try {
      if (pageId && userId) {
        await this.client.pages.update({
          page_id: pageId,
          properties: {
            "Assign To": {
              people: [
                {
                  id: userId,
                },
              ],
            },
          },
        });
      }
    } catch (error) {
      logger.db.notion({
        level: "error",
        message: `updatePageAssignTo: ${error}`,
      });
    }
  }
}

export default Notion;

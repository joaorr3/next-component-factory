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
  guildChannelUrl,
  image,
  paragraph,
  parseToNumberedList,
  scopeToLabel,
  severityLevelToEmoji,
  spacer,
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

  async getIssuesDatabase() {
    return await this.client.databases.retrieve({
      database_id: env.NOTION_ISSUES_DB_ID,
    });
  }

  public readonly pageStatus = {
    "Not started": {
      id: "}NqP",
      name: "Not started",
      color: "gray",
    },
    Design: {
      id: "^x,x",
      name: "Design",
      color: "purple",
    },
    "In progress": {
      id: "b7cf3a94-9136-4511-9578-f3a81c08fb77",
      name: "In progress",
      color: "blue",
    },
    Complete: {
      id: "nu=l",
      name: "Complete",
      color: "green",
    },
    Closed: {
      id: ":RHe",
      name: "Closed",
      color: "pink",
    },
  } as const;

  async addIssue({
    title,
    description,
    lab,
    author,
    // status = "TODO",
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
            status: this.pageStatus["Not started"],
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

  async updateIssueAttachments(pageId?: string, attachments?: string[]) {
    try {
      if (pageId) {
        await this.client.blocks.children.append({
          block_id: pageId,
          children: [
            {
              type: "toggle",
              toggle: {
                rich_text: [
                  {
                    type: "text",
                    text: {
                      content: "Attachments",
                    },
                  },
                ],
                children: attachments?.map((item) => image(item)),
              },
            },
          ],
        });
      }
    } catch (error) {
      logger.db.notion({
        level: "error",
        message: `updatePageStatus: ${error}`,
      });
    }
  }

  async updatePageStatus(
    pageId?: string,
    status: keyof typeof this.pageStatus = "Not started"
  ) {
    try {
      if (pageId) {
        await this.client.pages.update({
          page_id: pageId,
          properties: {
            Status: {
              status: this.pageStatus[status],
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

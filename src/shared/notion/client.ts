import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { env } from "../../env/server";
import { c18Avatar } from "../dataUtils";
import logger from "../logger";
import type { NotionIssueDetailsModel } from "../models";

import {
  bookmark,
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

  async getDatabase(id: string) {
    this.client.databases.query({
      database_id: id,
    });
    return await this.client.databases.retrieve({
      database_id: id,
    });
  }

  async getIssuesDatabase() {
    return await this.getDatabase(env.NOTION_ISSUES_DB_ID);
  }
  async getComponentDatabase() {
    const comp_map: Array<{ id: string; name: string }> = [];

    const get = async (cursor?: string) => {
      const { results, next_cursor } = await this.client.databases.query({
        database_id: env.NOTION_COMPONENTS_DB_ID,
        start_cursor: cursor,
      });

      results.forEach((page) => {
        comp_map.push({
          id: page.id,
          // @ts-ignore
          name: page.properties.Component.title[0].plain_text,
        });
      });

      if (next_cursor) {
        await get(next_cursor);
      }
    };

    await get();

    return comp_map;
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
    discordThreadId,
    version,
    type,
    stepsToReproduce,
    component,
    severity,
    specs,
    codeSnippet,
    scope,
    createdAt,
    attachments,
    componentId,
  }: NotionIssueDetailsModel) {
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
          {
            type: "callout",
            callout: {
              icon: {
                type: "emoji",
                emoji: "📄",
              },
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: "Description",
                  },
                },
              ],
              children: [
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
              ],
            },
          },
          {
            type: "callout",
            callout: {
              icon: {
                type: "emoji",
                emoji: "🚶",
              },
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: "Repro",
                  },
                },
              ],
              children: [...parseToNumberedList(stepsToReproduce)],
            },
          },
          {
            type: "callout",
            callout: {
              icon: {
                type: "emoji",
                emoji: "💁🏻‍♂️",
              },
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: "+ Info",
                  },
                },
              ],
              children: [
                paragraph(`Component: ${component}`),
                paragraph(`Severity: ${severityLevelToEmoji(severity)}`),
                paragraph(`Scope: ${scopeToLabel(scope)}`),
              ],
            },
          },
          ...spacer(),
          {
            type: "toggle",
            toggle: {
              color: "gray_background",
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: "Links",
                  },
                },
              ],
              children: [
                bookmark(specs, "Specs"),
                bookmark(codeSnippet, "Code Snippet"),
                bookmark(
                  guildChannelUrl(discordThreadId || ""),
                  "Discord Thread"
                ),
              ],
            },
          },
          ...spacer(),
          {
            type: "toggle",
            toggle: {
              color: "gray_background",
              rich_text: [
                {
                  type: "text",
                  text: {
                    content: "Attachments",
                  },
                },
              ],
              children: attachments?.map((url) => image(url)),
            },
          },
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
          Author: {
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
          "Atomic Components": {
            relation: [
              {
                id: componentId || "",
              },
            ],
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

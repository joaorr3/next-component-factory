import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { markdownToBlocks } from "@tryfabric/martian";
import { env } from "../../env/server";
import type {
  NotionPullRequestCommentedModel,
  NotionPullRequestCreatedModel,
  NotionPullRequestUpdatedModel,
  NotionPullRequestUpdateMergeStatusModel,
} from "../../utils/validators/notion";
import { c18Avatar } from "../dataUtils";
import logger from "../logger";
import type { NotionIssueDetailsModel } from "../models";

import dedent from "dedent";
import { ErrorHandler } from "../../utils/error";
import {
  bookmark,
  getPublicUrl,
  paragraph,
  parseToNumberedList,
  scopeToLabel,
  severityLevelToEmoji,
  spacer,
  videoOrImage,
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
    return await this.client.databases.retrieve({
      database_id: id,
    });
  }

  async getIssuesDatabase() {
    return await this.getDatabase(env.NOTION_ISSUES_DB_ID);
  }

  async getPrDatabase() {
    return await this.getDatabase(env.NOTION_PR_DB_ID);
  }

  async getPrDatabaseItems(cursor?: string) {
    const { results, next_cursor } = await this.client.databases.query({
      database_id: env.NOTION_PR_DB_ID,
      start_cursor: cursor,
    });

    const res = results.map((item) => ({
      // @ts-ignore
      title: item.properties.Name.title[0].plain_text,
      // @ts-ignore
      pageId: item.id,
    }));

    return { results: res, next_cursor };
  }

  @ErrorHandler({ code: "NOTION", message: "getAllPrs" })
  async getAllPrs() {
    const pageMap: Array<{ id: string; pullRequestId: string }> = [];

    const get = async (cursor?: string) => {
      const { results, next_cursor } = await this.client.databases.query({
        database_id: env.NOTION_PR_DB_ID,
        start_cursor: cursor,
      });

      for (const page of results) {
        pageMap.push({
          id: page.id,
          //prettier-ignore
          // @ts-ignore
          pullRequestId: page.properties?.pullRequestId?.rich_text?.[0]?.plain_text || null,
        });
      }

      if (next_cursor) {
        await get(next_cursor);
      }
    };

    await get();

    return pageMap;
  }

  @ErrorHandler({ code: "NOTION", message: "getPrPageByPrId" })
  async getPrPageByPrId(pullRequestId: string) {
    const allPrs = await this.getAllPrs();
    const prPage = allPrs.find((item) => item.pullRequestId === pullRequestId);

    if (prPage) {
      const res = await this.client.pages.retrieve({
        page_id: prPage.id,
      });
      return res.id;
    }
  }

  @ErrorHandler({ code: "NOTION", message: "createPr" })
  async createPr(data: NotionPullRequestCreatedModel) {
    if (!data.notionUserId) {
      return null;
    }

    const res = await this.client.pages.create({
      parent: {
        type: "database_id",
        database_id: env.NOTION_PR_DB_ID,
      },
      icon: {
        type: "external",
        external: {
          url: data.authorAvatar,
        },
      },
      properties: {
        title: {
          title: [{ type: "text", text: { content: data.title } }],
        },
        pullRequestId: {
          rich_text: [{ type: "text", text: { content: data.pullRequestId } }],
        },
        Person: {
          type: "people",
          people: [
            {
              id: data.notionUserId,
            },
          ],
        },
        Author: {
          rich_text: [{ type: "text", text: { content: data.authorName } }],
        },
        "Source Branch": {
          rich_text: [{ type: "text", text: { content: data.sourceBranch } }],
        },
        "Target Branch": {
          rich_text: [{ type: "text", text: { content: data.targetBranch } }],
        },
        "Merge Status": {
          select: {
            name: data.mergeStatus,
          },
        },
        "PR Status": {
          select: {
            name: data.status,
          },
        },
      },
      children: [...markdownToBlocks(dedent(data.description))],
    });

    return res.id;
  }

  @ErrorHandler({ code: "NOTION", message: "updatePr" })
  async updatePr(props: NotionPullRequestUpdatedModel) {
    const res = await this.client.pages.update({
      page_id: props.pageId,
      properties: {
        title: {
          title: [{ type: "text", text: { content: props.data.title } }],
        },
        Author: {
          rich_text: [
            { type: "text", text: { content: props.data.authorName } },
          ],
        },
        "Source Branch": {
          rich_text: [
            { type: "text", text: { content: props.data.sourceBranch } },
          ],
        },
        "Target Branch": {
          rich_text: [
            { type: "text", text: { content: props.data.targetBranch } },
          ],
        },
        "Merge Status": {
          select: {
            name: props.data.mergeStatus,
          },
        },
        "PR Status": {
          select: {
            name: props.data.status,
          },
        },
      },
    });

    const children = await this.client.blocks.children.list({
      block_id: props.pageId,
    });

    const childrenValues = Object.values(children.results);

    for (const item of childrenValues) {
      await this.client.blocks.delete({
        block_id: item.id,
      });
    }

    await this.client.blocks.children.append({
      block_id: props.pageId,
      children: [...markdownToBlocks(dedent(props.data.description))],
    });

    return res.id;
  }

  @ErrorHandler({ code: "NOTION", message: "updatePrMergeStatus" })
  async updatePrMergeStatus(props: NotionPullRequestUpdateMergeStatusModel) {
    const res = await this.client.pages.update({
      page_id: props.pageId,
      properties: {
        "Merge Status": {
          select: {
            name: props.data.mergeStatus,
          },
        },
        "PR Status": {
          select: {
            name: props.data.status,
          },
        },
      },
    });

    return res.id;
  }

  @ErrorHandler({ code: "NOTION", message: "commentedPr" })
  async commentedPr({
    pageId,
    data: { commentUrl, commentAuthorName },
  }: NotionPullRequestCommentedModel) {
    const res = await this.client.comments.create({
      parent: {
        page_id: pageId,
      },
      rich_text: [
        {
          text: {
            content: `${commentAuthorName} has commented`,
            link: {
              url: commentUrl,
            },
          },
        },
      ],
    });

    return res.id;
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

  @ErrorHandler({ code: "NOTION", message: "getComponentPageById" })
  async getComponentPageById(props: { id?: string; name?: string }) {
    const components = await this.getComponentDatabase();
    const componentPage = components.find(
      (item) => item.id === props.id || item.name === props.name
    );

    if (componentPage) {
      const res = await this.client.pages.retrieve({
        page_id: componentPage.id,
      });
      return res as PageObjectResponse;
    }
  }
  async getComponentMetadata(props: { name?: string }) {
    if (!props.name) {
      return {};
    }

    const res = await this.client.databases.query({
      database_id: env.NOTION_COMPONENTS_DB_ID,
      filter: {
        property: "title",
        type: "title",
        title: {
          equals: props.name,
        },
      },
    });

    const data = (res.results as PageObjectResponse[])[0];

    if (
      data &&
      data.object === "page" &&
      data.properties["Description"].type === "rich_text" &&
      data.properties["Figma Url"].type === "url"
    ) {
      return {
        description: data.properties["Description"].rich_text[0].plain_text,
        figmaUrl: data.properties["Figma Url"].url,
      };
    }

    return {
      description: "",
      figmaUrl: "",
    };
  }

  public readonly issuePageStatus = {
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

  @ErrorHandler({ code: "NOTION", message: "addIssue" })
  async addIssue(data: NotionIssueDetailsModel) {
    const {
      title,
      description,
      lab,
      author,
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
    } = data;

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
            children: attachments?.map((url) => videoOrImage(url)),
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
          status: this.issuePageStatus["Not started"],
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

    return res.id;
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
    status: keyof typeof this.issuePageStatus = "Not started"
  ) {
    try {
      if (pageId) {
        await this.client.pages.update({
          page_id: pageId,
          properties: {
            Status: {
              status: this.issuePageStatus[status],
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

  async updatePageThread(pageId?: string, threadUrl?: string) {
    try {
      if (pageId) {
        await this.client.pages.update({
          page_id: pageId,
          properties: {
            Thread: {
              url: threadUrl || "",
            },
          },
        });
      }
    } catch (error) {
      logger.db.notion({
        level: "error",
        message: `updatePageThread: ${error}`,
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

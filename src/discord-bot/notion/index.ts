import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { range } from "lodash";
import { guildChannelUrl } from "../bot/channels";
import { IssueScope, IssueSeverityLevel } from "../bot/commands/enums";
import { c18Avatar } from "../bot/constants";
import type { IssueDetailsModel, Notion } from "../models";
import { config } from "../utils";
import { logger } from "../utils/logger";

const space: Notion.Spacer = {
  paragraph: {
    rich_text: [
      {
        type: "text",
        text: {
          content: " ",
        },
      },
    ],
  },
};

const spacer = (amount = 1) => {
  return range(amount).map(() => space);
};

const parseToNumberedList = (text: string | null): Notion.NumberedList[] => {
  if (!text) return [];
  const list = text.split(";").filter((step) => !!step);

  return list.map((item) => {
    return {
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [
          {
            type: "text",
            text: {
              content: item,
            },
          },
        ],
      },
    };
  });
};

const bookmark = (url: string | null, caption: string): Notion.Bookmark => {
  return {
    type: "bookmark",
    bookmark: {
      url: url || "",
      caption: [
        {
          type: "text",
          text: {
            content: caption,
          },
        },
      ],
    },
  };
};

const paragraph = (content: string): Notion.Paragraph => {
  return {
    type: "paragraph",
    paragraph: {
      rich_text: [
        {
          type: "text",
          text: {
            content,
          },
        },
      ],
    },
  };
};

const checkBox = (
  checked: boolean | null,
  content: string
): Notion.CheckBox => {
  return {
    type: "to_do",
    to_do: {
      checked: !!checked,
      rich_text: [
        {
          type: "text",
          text: {
            content,
          },
        },
      ],
    },
  };
};

// append !!url.match(/.*.(webm|other|invalid|formats)/g);
const hasInvalidMediaFormat = (url: string) =>
  !!url.match(/.*.(webm|mp4|txt)/g);

const image = (
  url: string | null,
  description = ""
): Notion.Image | Notion.Spacer | Notion.Bookmark => {
  if (!url) {
    return space;
  }
  if (hasInvalidMediaFormat(url)) {
    return bookmark(url, description);
  }
  return {
    type: "image",
    image: {
      type: "external",
      external: {
        url,
      },
    },
  };
};

const public_URL = "https://xdteamwiki.notion.site";
const private_URL = "https://www.notion.so";

const getPublicUrl = (privateUrl: string) =>
  privateUrl.replace(private_URL, public_URL);

const severityLevelToEmoji = (severityLevel?: string | null) => {
  switch (severityLevel) {
    case IssueSeverityLevel.high:
      return "🔴";
    case IssueSeverityLevel.medium:
      return "🟡";
    case IssueSeverityLevel.low:
      return "🟢";
  }
};

const scopeToLabel = (scope?: string | null) => {
  switch (scope) {
    case IssueScope.dev:
      return "Dev 👨‍💻";
    case IssueScope.design:
      return "Design 💅";
    case IssueScope.both:
    default:
      return "Dev 👨‍💻 & Design 💅";
  }
};

export const startNotion = ({ start }: { start: boolean }) => {
  if (!start) return;

  const { NOTION_TOKEN, NOTION_ISSUES_DB_ID } = config();
  const notion = new Client({
    auth: NOTION_TOKEN,
  });

  if (notion) {
    logger.console.notion({
      level: "info",
      message: "Ready",
    });
  }

  const getPageIdByProperty = async (property: {
    name: string;
    value: string;
  }) => {
    try {
      const { results } = (await notion.databases.query({
        database_id: NOTION_ISSUES_DB_ID,
      })) as Notion.QueryDatabaseRes;

      const pagesProperty = (property: string) =>
        results.map((page) => {
          return {
            pageId: page.id,
            propertyId: page.properties[property].id,
          };
        });

      const pagesProperties = pagesProperty(property.name);

      const page = pagesProperties.find(async ({ pageId, propertyId }) => {
        const propertyResult = await notion.pages.properties.retrieve({
          page_id: pageId,
          property_id: propertyId,
        });

        return (
          propertyResult.type === "rich_text" &&
          propertyResult.rich_text.plain_text === property.value
        );
      });

      return page?.pageId;
    } catch (error) {
      logger.db.notion({
        level: "error",
        message: `getPageIdByProperty: ${error}`,
      });
    }
  };

  const addIssue = async ({
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
  }: IssueDetailsModel) => {
    try {
      const res = await notion.pages.create({
        parent: {
          type: "database_id",
          database_id: NOTION_ISSUES_DB_ID,
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
  };

  const getPageUrl = async (pageId: string) => {
    try {
      if (!pageId) {
        throw Error("Issue not found");
      }

      const res = (await notion.pages.retrieve({
        page_id: pageId,
      })) as PageObjectResponse;

      return getPublicUrl(res.url);
    } catch (error) {
      logger.db.notion({
        level: "error",
        message: `getPageUrl: ${error}`,
      });
    }
  };

  const forceUpdatePageStatus = async (
    threadId?: string,
    status: IssueDetailsModel["status"] = "TODO"
  ) => {
    try {
      if (!threadId) {
        throw Error("ThreadId not found");
      }

      const pageId = await getPageIdByProperty({
        name: "discord_id",
        value: threadId,
      });

      if (pageId) {
        await notion.pages.update({
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
        message: `forceUpdatePageStatus: ${error}`,
      });
    }
  };

  const updatePageStatus = async (
    pageId?: string,
    status: IssueDetailsModel["status"] = "TODO"
  ) => {
    try {
      if (pageId) {
        await notion.pages.update({
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
  };

  const updateCreatedAt = async (
    pageId?: string | null,
    createdAt?: Date | null
  ) => {
    try {
      if (pageId && createdAt) {
        await notion.pages.update({
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
  };

  const updatePageExternalIcon = async (
    pageId?: string | null,
    iconUrl?: string
  ) => {
    try {
      if (pageId) {
        await notion.pages.update({
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
  };

  return {
    addIssue,
    getPageUrl,
    forceUpdatePageStatus,
    updatePageStatus,
    updateCreatedAt,
    updatePageExternalIcon,
  };
};

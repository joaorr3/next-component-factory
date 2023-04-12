import { range } from "lodash";
import type * as NotionModels from "./models";
import { IssueScope, IssueSeverityLevel } from "../../shared/enums";

export const guildChannelUrl = (id: string) =>
  `https://discord.com/channels/973878486739591208/${id}`;

export const space: NotionModels.Spacer = {
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

export const spacer = (amount = 1) => {
  return range(amount).map(() => space);
};

export const parseToNumberedList = (
  text: string | null
): NotionModels.NumberedList[] => {
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

export const bookmark = (
  url: string | null,
  caption: string
): NotionModels.Bookmark => {
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

export const paragraph = (content: string): NotionModels.Paragraph => {
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

export const checkBox = (
  checked: boolean | null,
  content: string
): NotionModels.CheckBox => {
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
export const hasInvalidMediaFormat = (url: string) =>
  !!url.match(/.*.(webm|mp4|txt)/g);

export const image = (
  url: string | null,
  _description = ""
): NotionModels.Image | NotionModels.Spacer | NotionModels.Bookmark => {
  if (!url) {
    return space;
  }
  // if (hasInvalidMediaFormat(url)) {
  //   return bookmark(url, description);
  // }
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

export const getPublicUrl = (privateUrl: string) =>
  privateUrl.replace(private_URL, public_URL);

export const severityLevelToEmoji = (severityLevel?: string | null) => {
  switch (severityLevel) {
    case IssueSeverityLevel.high:
      return "🔴";
    case IssueSeverityLevel.medium:
      return "🟡";
    case IssueSeverityLevel.low:
      return "🟢";
  }
};

export const scopeToLabel = (scope?: string | null) => {
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

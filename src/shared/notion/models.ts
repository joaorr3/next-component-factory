import type {
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";

export type QueryDatabaseRes = Omit<QueryDatabaseResponse, "results"> & {
  results: Array<PageObjectResponse>;
};

export type TextValue = {
  text: {
    content: string;
    link?: {
      url: string;
    } | null;
  };
  type?: "text";
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?:
      | "default"
      | "gray"
      | "brown"
      | "orange"
      | "yellow"
      | "green"
      | "blue"
      | "purple"
      | "pink"
      | "red"
      | "gray_background"
      | "brown_background"
      | "orange_background"
      | "yellow_background"
      | "green_background"
      | "blue_background"
      | "purple_background"
      | "pink_background"
      | "red_background";
  };
};

export type Spacer = {
  paragraph: {
    rich_text: Array<TextValue>;
  };
};

export type NumberedList = {
  type: "numbered_list_item";
  numbered_list_item: {
    rich_text: Array<TextValue>;
  };
};

export type Bookmark = {
  type: "bookmark";
  bookmark: {
    url: string;
    caption: [
      {
        type: "text";
        text: {
          content: string;
        };
      }
    ];
  };
};

export type Paragraph = {
  type: "paragraph";
  paragraph: {
    rich_text: [
      {
        type: "text";
        text: {
          content: string;
        };
      }
    ];
  };
};

export type CheckBox = {
  type: "to_do";
  to_do: {
    checked: boolean;
    rich_text: [
      {
        type: "text";
        text: {
          content: string;
        };
      }
    ];
  };
};

export type Image = {
  type: "image";
  image: {
    type: "external";
    external: {
      url: string;
    };
  };
};

export type Video = {
  type: "video";
  video: {
    type: "external";
    external: {
      url: string;
    };
  };
};

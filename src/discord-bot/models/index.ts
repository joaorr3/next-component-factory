import type { Issue } from "@prisma/client";
import type { Attachment } from "discord.js";
export * as Notion from "./notion";

export type IssueDetailsModel = Omit<
  Issue,
  "id" | "issueIdMappingId" | "timestamp"
>;

export type OptionsDataExtractorModel = Omit<
  IssueDetailsModel,
  | "author"
  | "lab"
  | "discordThreadId"
  | "attachment"
  | "attachment2"
  | "createdAt"
  | "status"
> & { attachment: Attachment; attachment2: Attachment | null };

export type EmbeddedIssueBuilderModel = Omit<
  OptionsDataExtractorModel,
  "attachment" | "attachment2" | "scope" | "type" | "createdAt" | "status"
> & {
  attachmentUrl: string;
  author: {
    name: string;
    iconURL?: string;
  };
};

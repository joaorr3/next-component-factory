import type { Attachment } from "discord.js";
import { type IssueModel } from "../../shared/models";
export * as Notion from "./notion";

export type IssueDetailsModel = Omit<IssueModel, "platform">;

export type OptionsDataExtractorModel = Omit<
  IssueDetailsModel,
  | "author"
  | "lab"
  | "discordThreadId"
  | "attachment"
  | "attachment2"
  | "createdAt"
  | "status"
  | "platform"
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

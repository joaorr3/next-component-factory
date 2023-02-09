import { type Issue } from "@prisma/client";
import type { Attachment } from "discord.js";

export type IssueModel = Omit<Issue, "id" | "issueIdMappingId" | "timestamp">;

export type IssueDetailsModel = Omit<IssueModel, "platform">;

export type OptionsDataExtractorModel = Omit<
  IssueDetailsModel,
  | "author"
  | "lab"
  | "labId"
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

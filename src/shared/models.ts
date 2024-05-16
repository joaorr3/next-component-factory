import { type Issue } from "@prisma/client";
import type { GitPullRequest } from "azure-devops-node-api/interfaces/GitInterfaces";
import type { Attachment } from "discord.js";

export type IssueModel = Omit<Issue, "id" | "issueIdMappingId" | "timestamp">;

export type IssueDetailsModel = Omit<IssueModel, "platform">;

export type NotionIssueDetailsModel = IssueDetailsModel & {
  attachments?: string[];
};

export type DiscordIssueDetailsModel = {
  issue: IssueModel;
  notionPageUrl?: string;
};

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

export const mergeStatusMap = {
  0: "notSet",
  1: "queued",
  2: "conflicts",
  3: "succeeded",
  4: "rejectedByPolicy",
  5: "failure",
} as const;

export const statusMap = {
  0: "NotSet",
  1: "Active",
  2: "Abandoned",
  3: "Completed",
  4: "All",
} as const;

export type PullRequestModel = Omit<
  GitPullRequest,
  "mergeStatus" | "status"
> & {
  mergeStatus: (typeof mergeStatusMap)[keyof typeof mergeStatusMap];
  status: (typeof statusMap)[keyof typeof statusMap];
};

export type PRExchangeModel = {
  /**
   * Notion only
   */
  pageId?: string;
  pullRequestId: string;
  commitId: string;
  title: string;
  author?: string;
  authorId?: string;
  notionUserId?: string;
  creationDate?: string;
  url?: string;
  mergeStatus: PullRequestModel["mergeStatus"];
  status: PullRequestModel["status"];
  type?: "commit" | "pullRequest";
};

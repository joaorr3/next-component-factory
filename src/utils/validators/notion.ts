import { z } from "zod";

export const notionPullRequestCreatedValidator = z.object({
  notionUserId: z.string().optional(),
  pullRequestId: z.string(),
  authorName: z.string(),
  authorAvatar: z.string().url(),
  title: z.string(),
  description: z.string(),
  sourceBranch: z.string(),
  targetBranch: z.string(),
  mergeStatus: z.string(),
});

export type NotionPullRequestCreatedModel = z.infer<
  typeof notionPullRequestCreatedValidator
>;

export const notionPullRequestUpdatedValidator = z.object({
  pageId: z.string(),
  data: z.object({
    authorName: z.string(),
    authorAvatar: z.string().url(),
    title: z.string(),
    description: z.string(),
    sourceBranch: z.string(),
    targetBranch: z.string(),
    mergeStatus: z.string(),
  }),
});

export type NotionPullRequestUpdatedModel = z.infer<
  typeof notionPullRequestUpdatedValidator
>;

export const notionPullRequestCommentedValidator = z.object({
  pageId: z.string(),
  data: z.object({
    commentId: z.string(),
    commentAuthorName: z.string(),
    commentUrl: z.string().url(),
    markdown: z.string(),
  }),
});

export type NotionPullRequestCommentedModel = z.infer<
  typeof notionPullRequestCommentedValidator
>;

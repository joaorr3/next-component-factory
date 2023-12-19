import { z } from "zod";

export const pullRequestTableSchema = z.object({
  repository: z.object({
    id: z.string(),
    name: z.string(),
    url: z.string(),
    project: z.object({
      id: z.string(),
      name: z.string(),
      state: z.string(),
      visibility: z.number(),
      lastUpdateTime: z.date(),
    }),
  }),
  pullRequestId: z.number(),
  codeReviewId: z.number(),
  status: z.number(),
  createdBy: z.object({
    displayName: z.string(),
    url: z.string(),
    _links: z.object({ avatar: z.object({ href: z.string() }) }),
    id: z.string(),
    uniqueName: z.string(),
    imageUrl: z.string(),
    descriptor: z.string(),
  }),
  creationDate: z.date(),
  title: z.string(),
  description: z.string().optional(),
  sourceRefName: z.string(),
  targetRefName: z.string(),
  mergeStatus: z.string(),
  isDraft: z.boolean(),
  mergeId: z.string(),
  lastMergeSourceCommit: z.object({ commitId: z.string(), url: z.string() }),
  lastMergeTargetCommit: z.object({ commitId: z.string(), url: z.string() }),
  reviewers: z.array(
    z.union([
      z.object({
        reviewerUrl: z.string(),
        vote: z.number(),
        hasDeclined: z.boolean(),
        isFlagged: z.boolean(),
        displayName: z.string(),
        url: z.string(),
        _links: z.object({ avatar: z.object({ href: z.string() }) }),
        id: z.string(),
        uniqueName: z.string(),
        imageUrl: z.string(),
      }),
      z.object({
        reviewerUrl: z.string(),
        vote: z.number(),
        hasDeclined: z.boolean(),
        isRequired: z.boolean(),
        isFlagged: z.boolean(),
        displayName: z.string(),
        url: z.string(),
        _links: z.object({ avatar: z.object({ href: z.string() }) }),
        id: z.string(),
        uniqueName: z.string(),
        imageUrl: z.string(),
      }),
    ])
  ),
  url: z.string(),
  supportsIterations: z.boolean(),
});

export const mergeStatusMap = {
  0: "notSet",
  1: "queued",
  2: "conflicts",
  3: "succeeded",
  4: "rejectedByPolicy",
  5: "failure",
} as const;

export type MergeStatusKey = keyof typeof mergeStatusMap;

export type PullRequestTableModel = z.infer<typeof pullRequestTableSchema>;

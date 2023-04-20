import { z } from "zod";

export const pullRequestCreatedValidator = z.object({
  subscriptionId: z.string(),
  notificationId: z.number(),
  id: z.string(),
  eventType: z.string(),
  publisherId: z.string(),
  message: z.object({ markdown: z.string() }),
  detailedMessage: z.object({ markdown: z.string() }),
  resource: z.object({
    repository: z.object({
      id: z.string(),
      name: z.string(),
      url: z.string(),
      project: z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        url: z.string(),
        state: z.string(),
        revision: z.number(),
        visibility: z.string(),
        lastUpdateTime: z.string(),
      }),
      size: z.number(),
      remoteUrl: z.string(),
      sshUrl: z.string(),
      webUrl: z.string(),
      isDisabled: z.boolean(),
      isInMaintenance: z.boolean(),
    }),
    pullRequestId: z.number(),
    codeReviewId: z.number(),
    status: z.string(),
    createdBy: z.object({
      displayName: z.string(),
      url: z.string(),
      _links: z.object({ avatar: z.object({ href: z.string() }) }),
      id: z.string(),
      uniqueName: z.string(),
      imageUrl: z.string(),
      descriptor: z.string(),
    }),
    creationDate: z.string(),
    title: z.string(),
    description: z.string(),
    sourceRefName: z.string(),
    targetRefName: z.string(),
    mergeStatus: z.string(),
    isDraft: z.boolean(),
    mergeId: z.string(),
    lastMergeSourceCommit: z.object({ commitId: z.string(), url: z.string() }),
    lastMergeTargetCommit: z.object({ commitId: z.string(), url: z.string() }),
    lastMergeCommit: z.object({
      commitId: z.string(),
      author: z.object({
        name: z.string(),
        email: z.string(),
        date: z.string(),
      }),
      committer: z.object({
        name: z.string(),
        email: z.string(),
        date: z.string(),
      }),
      comment: z.string(),
      url: z.string(),
    }),
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
    _links: z.object({
      web: z.object({ href: z.string() }),
      statuses: z.object({ href: z.string() }),
    }),
    supportsIterations: z.boolean(),
    artifactId: z.string(),
  }),
  resourceVersion: z.string(),
  resourceContainers: z.object({
    collection: z.object({ id: z.string(), baseUrl: z.string() }),
    account: z.object({ id: z.string(), baseUrl: z.string() }),
    project: z.object({ id: z.string(), baseUrl: z.string() }),
  }),
  createdDate: z.string(),
});

export type PullRequestCreatedModel = z.infer<
  typeof pullRequestCreatedValidator
>;

export const pullRequestCommentedOnValidator = z.object({
  subscriptionId: z.string(),
  notificationId: z.number(),
  id: z.string(),
  eventType: z.string(),
  publisherId: z.string(),
  message: z.object({ markdown: z.string() }),
  detailedMessage: z.object({ markdown: z.string() }),
  resource: z.object({
    comment: z.object({
      id: z.number(),
      parentCommentId: z.number(),
      author: z.object({
        displayName: z.string(),
        url: z.string(),
        id: z.string(),
        uniqueName: z.string(),
        imageUrl: z.string(),
      }),
      content: z.string(),
      publishedDate: z.string(),
      lastUpdatedDate: z.string(),
      lastContentUpdatedDate: z.string(),
      commentType: z.string(),
      _links: z.object({
        self: z.object({ href: z.string() }),
        repository: z.object({ href: z.string() }),
        threads: z.object({ href: z.string() }),
      }),
    }),
    pullRequest: z.object({
      repository: z.object({
        id: z.string(),
        name: z.string(),
        url: z.string(),
        project: z.object({
          id: z.string(),
          name: z.string(),
          url: z.string(),
          state: z.string(),
          visibility: z.string(),
          lastUpdateTime: z.string(),
        }),
        defaultBranch: z.string(),
        remoteUrl: z.string(),
      }),
      pullRequestId: z.number(),
      status: z.string(),
      createdBy: z.object({
        displayName: z.string(),
        url: z.string(),
        id: z.string(),
        uniqueName: z.string(),
        imageUrl: z.string(),
      }),
      creationDate: z.string(),
      title: z.string(),
      description: z.string(),
      sourceRefName: z.string(),
      targetRefName: z.string(),
      mergeStatus: z.string(),
      mergeId: z.string(),
      lastMergeSourceCommit: z.object({
        commitId: z.string(),
        url: z.string(),
      }),
      lastMergeTargetCommit: z.object({
        commitId: z.string(),
        url: z.string(),
      }),
      lastMergeCommit: z.object({ commitId: z.string(), url: z.string() }),
      reviewers: z.array(
        z.object({
          reviewerUrl: z.null(),
          vote: z.number(),
          displayName: z.string(),
          url: z.string(),
          id: z.string(),
          uniqueName: z.string(),
          imageUrl: z.string(),
          isContainer: z.boolean(),
        })
      ),
      commits: z.array(z.object({ commitId: z.string(), url: z.string() })),
      url: z.string(),
      _links: z.object({
        web: z.object({ href: z.string() }),
        statuses: z.object({ href: z.string() }),
      }),
    }),
  }),
  resourceVersion: z.string(),
  resourceContainers: z.object({
    collection: z.object({ id: z.string() }),
    account: z.object({ id: z.string() }),
    project: z.object({ id: z.string() }),
  }),
  createdDate: z.string(),
});

export type PullRequestCommentedOnModel = z.infer<
  typeof pullRequestCreatedValidator
>;

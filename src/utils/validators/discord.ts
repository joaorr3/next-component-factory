import { z } from "zod";

export const baseValidator = z.object({
  subscriptionId: z.string(),
  notificationId: z.number(),
  id: z.string(),
  eventType: z.string(),
  publisherId: z.string(),
  message: z.object({
    markdown: z.string(),
  }),
  detailedMessage: z.object({
    markdown: z.string(),
  }),
  resourceVersion: z.string(),
  resourceContainers: z.object({
    collection: z.object({
      id: z.string(),
      baseUrl: z.string().optional(),
    }),
    account: z.object({
      id: z.string(),
      baseUrl: z.string().optional(),
    }),
    project: z.object({
      id: z.string(),
      baseUrl: z.string().optional(),
    }),
  }),
  createdDate: z.string().datetime(),
});

export const workItemValidator = baseValidator.merge(
  z.object({
    resource: z.object({
      id: z.number(),
      rev: z.number(),
      fields: z.object({
        "System.AreaPath": z.string(),
        "System.TeamProject": z.string(),
        "System.IterationPath": z.string(),
        "System.WorkItemType": z.string(),
        "System.State": z.string(),
        "System.Reason": z.string(),
        "System.CreatedDate": z.string().datetime(),
        "System.CreatedBy": z.string(),
        "System.ChangedDate": z.string().datetime(),
        "System.ChangedBy": z.string(),
        "System.CommentCount": z.number(),
        "System.Title": z.string(),
        "Microsoft.VSTS.Common.StateChangeDate": z.string(),
        "Microsoft.VSTS.Common.Priority": z.number(),
      }),
      _links: z.object({
        self: z.object({
          href: z.string(),
        }),
        workItemUpdates: z.object({
          href: z.string(),
        }),
        workItemRevisions: z.object({
          href: z.string(),
        }),
        workItemComments: z.object({
          href: z.string(),
        }),
        html: z.object({
          href: z.string(),
        }),
        workItemType: z.object({
          href: z.string(),
        }),
        fields: z.object({
          href: z.string(),
        }),
      }),
      url: z.string(),
    }),
  })
);

export const prValidator = baseValidator.merge(
  z.object({
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
          lastUpdateTime: z.string().datetime(),
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
        _links: z.object({
          avatar: z.object({
            href: z.string(),
          }),
        }),
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
      lastMergeSourceCommit: z.object({
        commitId: z.string(),
        url: z.string(),
      }),
      lastMergeTargetCommit: z.object({
        commitId: z.string(),
        url: z.string(),
      }),
      reviewers: z.array(
        z.object({
          reviewerUrl: z.string().nullable(),
          vote: z.number(),
          hasDeclined: z.boolean(),
          isFlagged: z.boolean(),
          displayName: z.string(),
          url: z.string(),
          _links: z.object({
            avatar: z.object({
              href: z.string(),
            }),
          }),
          id: z.string(),
          uniqueName: z.string(),
          imageUrl: z.string(),
        })
      ),
      url: z.string(),
      _links: z.object({
        web: z.object({
          href: z.string(),
        }),
        statuses: z.object({
          href: z.string(),
        }),
      }),
      supportsIterations: z.boolean(),
      artifactId: z.string(),
    }),
  })
);

export const buildValidator = baseValidator.merge(
  z.object({
    resource: z.object({
      uri: z.string(),
      id: z.number(),
      buildNumber: z.string(),
      url: z.string(),
      startTime: z.string(),
      finishTime: z.string(),
      reason: z.string(),
      status: z.string(),
      dropLocation: z.string(),
      drop: z.object({
        location: z.string(),
        type: z.string(),
        url: z.string(),
        downloadUrl: z.string(),
      }),
      log: z.object({
        type: z.string(),
        url: z.string(),
        downloadUrl: z.string(),
      }),
      sourceGetVersion: z.string(),
      lastChangedBy: z.object({
        displayName: z.string(),
        url: z.string(),
        id: z.string(),
        uniqueName: z.string(),
        imageUrl: z.string(),
      }),
      retainIndefinitely: z.boolean(),
      hasDiagnostics: z.boolean(),
      definition: z.object({
        batchSize: z.number(),
        triggerType: z.string(),
        definitionType: z.string(),
        id: z.number(),
        name: z.string(),
        url: z.string(),
      }),
      queue: z.object({
        queueType: z.string(),
        id: z.number(),
        name: z.string(),
        url: z.string(),
      }),
      requests: z.array(
        z.object({
          id: z.number(),
          url: z.string(),
          requestedFor: z.object({
            displayName: z.string(),
            url: z.string(),
            id: z.string(),
            uniqueName: z.string(),
            imageUrl: z.string(),
          }),
        })
      ),
    }),
  })
);

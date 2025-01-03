import * as Azure from "azure-devops-node-api";
import { type GitRepository } from "azure-devops-node-api/interfaces/GitInterfaces";
import dayjs from "dayjs";
import { env } from "../env/server";
import { ServiceErrorHandler } from "../utils/error";
import type { PRExchangeModel } from "./models";
import { mergeStatusMap, statusMap, type PullRequestModel } from "./models";
import { getPullRequestUrl } from "./utils";

const orgUrl = "https://dev.azure.com/ptbcp";

export class AzureClient {
  public client: Azure.WebApi | undefined;

  private static _instance: AzureClient = new AzureClient();
  public designSystemRepo: GitRepository | null = null;
  private designSystemRepoId = "caa5a412-6db0-4692-9050-7813ed49125f";

  private constructor() {
    this.initialize();
  }

  @ServiceErrorHandler({ code: "AZURE", message: "initialize" })
  private async initialize() {
    try {
      const authHandler = Azure.getPersonalAccessTokenHandler(env.AZURE_TOKEN);
      this.client = new Azure.WebApi(orgUrl, authHandler);
      await this.client.connect();
    } catch (error) {
      console.warn("The Azure Access Token probably is expired.");
    }
  }

  @ServiceErrorHandler({ code: "AZURE", message: "getDevelopCommits" })
  private async getDevelopCommits(): Promise<PRExchangeModel[]> {
    const gitApi = await this.client?.getGitApi();

    const thirtyDaysAgo = dayjs().subtract(1, "month").toISOString();

    const devCommits =
      (await gitApi?.getCommits(this.designSystemRepoId, {
        fromDate: thirtyDaysAgo,
        itemVersion: {
          version: "develop",
        },
        includePushData: true,
      })) || [];

    const commits = devCommits
      .filter(
        ({ comment }) =>
          comment?.startsWith("feat") || comment?.startsWith("fix")
      )
      .map((commit): PRExchangeModel => {
        return {
          commitId: commit.commitId!,
          pullRequestId: "",
          title: commit.comment!,
          url: commit.remoteUrl,
          mergeStatus: "succeeded",
          status: "Completed",
          author: commit.author?.name,
          creationDate: dayjs(commit.author?.date!).toISOString(),
          authorId: commit.push?.pushedBy?.id,
          type: "commit",
        };
      });

    return commits;
  }

  @ServiceErrorHandler({ code: "AZURE", message: "getDetailedPullRequests" })
  public async getDetailedPullRequests(): Promise<PullRequestModel[]> {
    const gitApi = await this.client?.getGitApi();

    const dsPullRequests =
      (await gitApi?.getPullRequests(
        this.designSystemRepoId,
        {
          status: 4,
        },
        undefined,
        undefined,
        undefined,
        800
      )) || [];

    return dsPullRequests
      .map((pr) => {
        return {
          ...pr,
          mergeStatus:
            mergeStatusMap[pr.mergeStatus as keyof typeof mergeStatusMap],
          status: statusMap[pr.status as keyof typeof statusMap],
        };
      })
      .filter(
        // We don't care about items without a lastMergeCommit or drafts
        ({ isDraft }) => !isDraft
      ) as unknown as PullRequestModel[];
  }

  @ServiceErrorHandler({ code: "AZURE", message: "getPullRequests" })
  public async getPullRequests(): Promise<PRExchangeModel[]> {
    const detailedPrs = await this.getDetailedPullRequests();

    return detailedPrs.map(
      (pr): PRExchangeModel => ({
        pullRequestId: String(pr.pullRequestId),
        commitId: pr.lastMergeCommit?.commitId || "",
        title: pr.title!,
        author: pr.createdBy?.displayName!,
        creationDate: dayjs(pr.creationDate as unknown as string).toISOString(),
        url: getPullRequestUrl(String(pr.pullRequestId)),
        mergeStatus: pr.mergeStatus || "notSet",
        status: pr.status,
        authorId: pr.createdBy?.id,
        type: "pullRequest",
      })
    );
  }

  @ServiceErrorHandler({ code: "AZURE", message: "getReleaseItems" })
  public async getReleaseItems(): Promise<PRExchangeModel[]> {
    const developCommits = await this.getDevelopCommits();
    const pullRequests = await this.getPullRequests();

    const releaseItemsWithoutPR = developCommits.filter(
      (cmt) => !pullRequests.some((pr) => cmt.commitId === pr.commitId)
    );

    return pullRequests.concat(releaseItemsWithoutPR);
  }

  @ServiceErrorHandler({ code: "AZURE", message: "createWorkItem" })
  public async createWorkItem({
    title,
    description,
    author,
    threadUrl,
    tags,
  }: {
    title: string;
    description: string;
    author: string;
    threadUrl: string;
    tags: string[];
  }) {
    const workItemApi = await this.client?.getWorkItemTrackingApi();

    const _description = [
      `Author: ${author}`,
      `Tags: ${tags.join("; ")}`,
      "\n",
      `Description: ${description}`,
      "\n",
    ];

    const workItemPayload = [
      // {
      //   op: "add",
      //   path: "/fields/System.AssignedTo",
      //   value: env.ASSIGNED_TO,
      // },
      {
        op: "add",
        path: "/fields/System.Title",
        value: title,
      },
      {
        op: "add",
        path: "/fields/System.Description",
        value: _description.join("\n").replace(/\n/g, "<br/>"),
      },
      {
        op: "add",
        path: "/fields/System.WorkItemType",
        value: "User Story",
        // value: "Issue",
      },
      // {
      //   op: "add",
      //   path: "/fields/Microsoft.VSTS.Common.AcceptanceCriteria",
      //   value: ".",
      // },
      // {
      //   op: "add",
      //   path: "/fields/System.State",
      //   value: "Active",
      // },
      {
        op: "add",
        path: "/fields/System.AreaPath",
        value: "IT.DIT\\DIT\\DesignSystem",
      },
      {
        op: "add",
        path: "/fields/System.IterationPath",
        value: "IT.DIT\\DIT",
      },
      {
        op: "add",
        path: "/fields/System.Tags",
        value: "Discord Issue;",
      },
      {
        op: "add",
        path: "/relations/-",
        value: {
          rel: "System.LinkTypes.Hierarchy-Reverse",
          url: "https://dev.azure.com/fabrikam/_apis/wit/workItems/697212",
          attributes: {
            comment: "Making a new link for the dependency",
          },
        },
      },
      {
        op: "add",
        path: "/relations/-",
        value: {
          rel: "Hyperlink",
          url: threadUrl,
        },
      },
    ];

    const createdWorkItem = await workItemApi?.createWorkItem(
      null,
      workItemPayload,
      "6972fd8c-2a19-4b27-a72b-d650691f5943",
      "User Story"
    );

    return createdWorkItem;
  }

  public static get Instance(): AzureClient {
    return this._instance;
  }
}

export const azureSharedClient = AzureClient.Instance;

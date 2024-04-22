import * as Azure from "azure-devops-node-api";
import {
  type GitPullRequest,
  type GitRepository,
} from "azure-devops-node-api/interfaces/GitInterfaces";
import { env } from "../env/server";

const orgUrl = "https://dev.azure.com/ptbcp";

const authHandler = Azure.getPersonalAccessTokenHandler(env.AZURE_TOKEN);

const mergeStatusMap = {
  0: "notSet",
  1: "queued",
  2: "conflicts",
  3: "succeeded",
  4: "rejectedByPolicy",
  5: "failure",
} as const;

type PullRequest = Omit<GitPullRequest, "mergeStatus"> & {
  mergeStatus: (typeof mergeStatusMap)[keyof typeof mergeStatusMap];
};

export class AzureClient {
  public client = new Azure.WebApi(orgUrl, authHandler);

  private static _instance: AzureClient = new AzureClient();
  public designSystemRepo: GitRepository | null = null;

  private constructor() {
    this.connect();
  }

  private async connect() {
    await this.client.connect();
  }

  public async getPullRequests(): Promise<PullRequest[]> {
    const gitApi = await this.client.getGitApi();

    if (!this.designSystemRepo) {
      const repos = await gitApi.getRepositories();
      const designSystemRepo = repos.find(
        (repo) => repo.name === "BCP.DesignSystem"
      );
      if (designSystemRepo) {
        this.designSystemRepo = designSystemRepo;
      }
    }

    if (this.designSystemRepo?.id) {
      const dsPullRequests =
        (await gitApi.getPullRequests(this.designSystemRepo.id, {})) || [];

      return dsPullRequests.map((pr) => {
        return {
          ...pr,
          mergeStatus:
            mergeStatusMap[pr.mergeStatus as keyof typeof mergeStatusMap],
        };
      }) as unknown as PullRequest[];
    }

    return [] as PullRequest[];
  }

  public async createWorkItem({
    title,
    description,
    author,
    threadUrl,
  }: {
    title: string;
    description: string;
    author: string;
    threadUrl: string;
  }) {
    const workItemApi = await this.client.getWorkItemTrackingApi();

    const _description = [
      `Author: ${author}`,
      "\n",
      description,
      "\n",
      `<a href="${threadUrl}">Discord Thread</a>`,
    ];

    const workItemPayload = [
      {
        op: "add",
        path: "/fields/System.AssignedTo",
        value: env.ASSIGNED_TO,
      },
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
      },
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

    const createdWorkItem = await workItemApi.createWorkItem(
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

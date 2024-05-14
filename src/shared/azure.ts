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

const statusMap = {
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

  public async getPullRequests(): Promise<PullRequestModel[]> {
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
        (await gitApi.getPullRequests(this.designSystemRepo.id, {
          status: 4,
        })) || [];

      return dsPullRequests.map((pr) => {
        return {
          ...pr,
          mergeStatus:
            mergeStatusMap[pr.mergeStatus as keyof typeof mergeStatusMap],
          status: statusMap[pr.status as keyof typeof statusMap],
        };
      }) as unknown as PullRequestModel[];
    }

    return [] as PullRequestModel[];
  }

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
    const workItemApi = await this.client.getWorkItemTrackingApi();

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

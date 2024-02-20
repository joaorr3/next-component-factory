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

  public static get Instance(): AzureClient {
    return this._instance;
  }
}

export const azureSharedClient = AzureClient.Instance;

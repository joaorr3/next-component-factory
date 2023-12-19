import * as Azure from "azure-devops-node-api";
import { env } from "../env/server";

const orgUrl = "https://dev.azure.com/ptbcp";

const authHandler = Azure.getPersonalAccessTokenHandler(env.AZURE_TOKEN);

export class AzureClient {
  public client = new Azure.WebApi(orgUrl, authHandler);

  private static _instance: AzureClient = new AzureClient();

  private constructor() {
    this.connect();
  }

  private async connect() {
    await this.client.connect();
  }

  public static get Instance(): AzureClient {
    return this._instance;
  }
}

export const azureSharedClient = AzureClient.Instance;

import * as Azure from "azure-devops-node-api";
import * as Graph from "azure-devops-node-api/interfaces/GraphInterfaces";

const orgUrl = "https://dev.azure.com/ptbcp";
// const orgUrl = "https://vssps.dev.azure.com/ptbcp";

const token = "2gl7xkr2g7l2iamzrg23nw5vf3nrfhvuds7i3zgaw6333pdmwxxa"; //process.env.AZURE_PERSONAL_ACCESS_TOKEN;

const authHandler = Azure.getPersonalAccessTokenHandler(token);

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

import type { PullRequest, PrismaClient } from "@prisma/client";
import { CrudHandler } from "./interfaces";
import type { ParsedMail } from "../../../discord-bot/azure/types/mail";

export class PullRequestsManager extends CrudHandler<PullRequest> {
  override client: PrismaClient;
  constructor(_client: PrismaClient) {
    super(_client, "pullRequest");
    this.client = _client;
  }

  async createByMail(mail: ParsedMail, guildUserId: string) {
    const createdPullRequest = await this.client.pullRequest.create({
      data: {
        pullRequestId: mail.pullRequest.id,
        title: mail.pullRequest.title,
        url: mail.pullRequest.url,
        lastAction: mail.action,
        lastActionGuildUserId: guildUserId,
        guildUserId,
      },
    });

    return createdPullRequest;
  }

  async findPullRequestById(pullRequestId: number) {
    try {
      const pullRequest = await this.client.pullRequest.findUnique({
        where: {
          pullRequestId: pullRequestId,
        },
      });

      return pullRequest;
    } catch (error) {
      console.log(
        "error -> [PullRequestsManager.findPullRequestById]: ",
        error
      );
    }
  }
}

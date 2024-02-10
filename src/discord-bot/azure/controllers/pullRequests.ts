import prisma from "../../data";
import type { ParsedMail } from "../../../discord-bot/azure/types/mail";
import logger from "../../../shared/logger";
import type { PullRequest } from "@prisma/client";

class PullRequestController {
  static async processMail(mail: ParsedMail): Promise<PullRequest | undefined> {
    const actionGuildUser = await prisma.guildUser.getGuildUserByFriendlyName(
      mail.author
    );

    if (!actionGuildUser) {
      logger.console.server({
        level: "error",
        message: `PullRequest [${mail.pullRequest.id}] [${mail.author}] not found in channel [GuildUser]`,
      });

      return;
    }

    let pr = await prisma.pullRequests.findPullRequestById(mail.pullRequest.id);

    if (!pr && mail.isCreated) {
      pr = await prisma.pullRequests.createByMail(mail, actionGuildUser.id);
    }

    if (!pr) {
      logger.console.server({
        level: "error",
        message: `PullRequest [${mail.pullRequest.id}] not found`,
      });

      return;
    }

    const payloadToUpdatePullRequest: Partial<PullRequest> = {
      lastAction: mail.action,
      lastActionGuildUserId: actionGuildUser.id,
    };

    if (mail.isPublished) {
      payloadToUpdatePullRequest.publishedAt = new Date();
      payloadToUpdatePullRequest.status = "PENDING";
    }

    if (mail.isCompleted) {
      payloadToUpdatePullRequest.completedAt = new Date();
      payloadToUpdatePullRequest.status = "COMPLETED";
    }

    if (mail.isAbandoned) {
      payloadToUpdatePullRequest.completedAt = new Date();
      payloadToUpdatePullRequest.status = "CANCELLED";
    }

    const updatedPr = await prisma.pullRequests.update(
      payloadToUpdatePullRequest,
      pr.id
    );

    if (!updatedPr) {
      logger.console.server({
        level: "error",
        message: `PullRequest [${mail.pullRequest.id}] not updated`,
      });

      return;
    }

    return updatedPr;
  }
}

export default PullRequestController;

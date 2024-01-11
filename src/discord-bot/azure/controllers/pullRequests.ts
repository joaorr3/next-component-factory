import prisma from "../../data";
import type { ParsedMail } from "../../../discord-bot/azure/types/mail";
import logger from "../../../shared/logger";
import type { PullRequest } from "@prisma/client";

class PullRequestController {
  static async processMail(mail: ParsedMail) {
    const guildUser = await prisma.guildUser.getGuildUserByFriendlyName(
      mail.author
    );

    if (!guildUser) {
      logger.console.server({
        level: "error",
        message: `PullRequest [${mail.pullRequest.id}] [${mail.author}] not found in channel [GuildUser]`,
      });

      return;
    }

    let pr = await prisma.pullRequests.findPullRequestById(mail.pullRequest.id);

    if (!pr) {
      pr = await prisma.pullRequests.createByMail(mail, guildUser.id);
    }

    const payloadToUpdatePullRequest: Partial<PullRequest> = {
      lastAction: mail.action,
    };

    if (mail.isCompleted || mail.isAbandoned) {
      payloadToUpdatePullRequest.completedAt = new Date();
    }

    await prisma.pullRequests.update(payloadToUpdatePullRequest, pr.id);

    return guildUser;
  }
}

export default PullRequestController;

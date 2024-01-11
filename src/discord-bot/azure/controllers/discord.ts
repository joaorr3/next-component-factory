import type { ParsedMail } from "./../types/mail";
import type { DiscordPayloadEmbedField, PayloadProps } from "../types/discord";

import config from "../config/discord";

import type { Client, MessageCreateOptions, TextChannel } from "discord.js";
import { roleMention, userMention } from "discord.js";
import { discordSharedClient } from "../../../shared/discord";
import logger from "../../../shared/logger";
import { pull, truncate } from "lodash";
import type { GuildUser, PullRequest } from "@prisma/client";

class AzureDiscord {
  private client;

  constructor(client: Client<boolean>) {
    this.client = client;
  }

  private getThreadName(mail: ParsedMail) {
    const id = mail.pullRequest.id;
    const title = mail.pullRequest.title;
    const threadName = `[${id}] ${title}`;
    return truncate(threadName, { length: 100, omission: "" });
  }

  async processMail(mail: ParsedMail, pullRequest?: PullRequest) {
    try {
      await this.refreshCache();
      this.normalizeTitle(mail);

      if (mail.isCreated) {
        await this.createPullRequest(mail);
        return;
      }

      if (mail.isCompleted || mail.isAbandoned) {
        return await this.closePullRequest(mail);
      }

      return await this.updatePullRequest(mail, pullRequest);
    } catch (error) {
      console.log("azure:discord:error:processMail ", error);
    }
  }

  private async createPullRequest(mail: ParsedMail) {
    const payload = this.createPayload({
      title: mail.pullRequest.title,
      description: mail.action,
      mail,
    });

    const channelName = config.pullRequestChannelName;
    const channel = this.getChannelByName(channelName);

    if (!channel) {
      logger.console.discord({
        level: "error",
        message: `Channel [${channelName}] not found`,
      });
      return;
    }

    const thread = await channel.threads.create({
      name: this.getThreadName(mail),
      reason: mail.action,
      autoArchiveDuration: 10080,
    });

    await thread.join();
    await thread.send(payload);

    return thread;
  }

  private async updatePullRequest(mail: ParsedMail, pullRequest?: PullRequest) {
    let description = mail.pullRequest.title;

    if ((mail.isCommented || mail.isCommentReplied) && mail.comment) {
      description = mail.comment;
    }

    if (mail.isUpdated) {
      description = "Need to approve again";
    }

    if (mail.isApproved) {
      description = ":white_check_mark: Approved";
    }

    if (mail.isAutoComplete) {
      description = ":timer: Auto Complete";
    }

    const payload = this.createPayload({
      title: mail.action,
      description,
      mail,
      pullRequest,
    });

    const channelName = config.pullRequestChannelName;
    const channel = this.getChannelByName(config.pullRequestChannelName);

    if (!channel) {
      logger.console.discord({
        level: "error",
        message: `Channel [${channelName}] not found`,
      });
      return;
    }

    let thread = this.getThreadInChannelById(channel, mail.pullRequest.id);

    if (!thread) {
      thread = await this.createPullRequest(mail);
    }

    await thread?.send(payload);
  }

  private async closePullRequest(mail: ParsedMail) {
    let description = mail.pullRequest.title;

    if (mail.isCompleted) {
      description = ":white_check_mark: Finished";
    }

    if (mail.isAbandoned) {
      description = ":no_entry_sign: Canceled";
    }

    const payload = this.createPayload({
      title: mail.action,
      description,
      mail,
    });

    const channelName = config.pullRequestChannelName;
    const channel = this.getChannelByName(config.pullRequestChannelName);

    if (!channel) {
      logger.console.discord({
        level: "error",
        message: `Channel [${channelName}] not found`,
      });
      return;
    }

    const thread = this.getThreadInChannelById(channel, mail.pullRequest.id);

    if (!thread) {
      logger.console.discord({
        level: "error",
        message: `Thread [${mail.pullRequest.id}] [${mail.pullRequest.title}] not found in channel [${channelName}]`,
      });
      return;
    }

    await thread.send(payload);
    await thread.setArchived(true);
  }

  private createPayload({
    title,
    description,
    mail,
    pullRequest,
  }: PayloadProps): MessageCreateOptions {
    const isUpdatedByOwner =
      pullRequest?.guildUserId === pullRequest?.lastActionGuildUserId;
    const reviewersFields: DiscordPayloadEmbedField[] = [];

    if (mail.reviewers) {
      const reviewers = mail.reviewers?.map((reviewer) => ({
        name: reviewer.user,
        value: reviewer.approved ? ":white_check_mark:" : ":clock3:",
        inline: true,
      }));

      reviewersFields.push(...reviewers);
    }

    const embedMessage = discordSharedClient.embed({
      title,
      url: mail.pullRequest.url,
      description,
      author: {
        name: mail.author,
      },
      fields: [
        { name: "\u200B", value: "\u200B" },
        { name: "Reviewers", value: "Selected reviewers" },
        ...reviewersFields,
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: "see this update",
        iconURL: config.avatar,
      },
    });

    const guildDevRole = discordSharedClient.role("dev");

    const guildDevRoleMention = guildDevRole
      ? roleMention(guildDevRole.id)
      : undefined;

    const ownerMention = pullRequest
      ? userMention(pullRequest.guildUserId)
      : undefined;

    const mention = isUpdatedByOwner ? guildDevRoleMention : ownerMention;

    const safeMention = mention ?? guildDevRoleMention; // default mention to dev role

    const payload: MessageCreateOptions = {
      content: safeMention,
      embeds: [embedMessage],
    };

    return payload;
  }

  private normalizeTitle(mail: ParsedMail) {
    mail.pullRequest.title = mail.pullRequest.title.replace(":", "");
  }

  private async refreshCache() {
    await this.client.guilds.fetch();
  }

  private getChannelByName(channelName: string) {
    for (const cachedChannel of this.client.channels.cache) {
      const channel = cachedChannel[1] as TextChannel;
      if (channel.name === channelName) {
        return channel;
      }
    }
  }

  private getThreadInChannelById(channel: TextChannel, pullRequestId: number) {
    const initialThreadNameWithId = `[${pullRequestId}]`;

    for (const cachedThread of channel.threads.cache) {
      const thread = cachedThread[1];
      if (thread.name.includes(initialThreadNameWithId) && !thread.archived) {
        return thread;
      }
    }
  }
}

export default AzureDiscord;

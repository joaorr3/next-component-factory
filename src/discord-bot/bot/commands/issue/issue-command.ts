import Discord, { channelMention, userMention } from "discord.js";
import logger from "../../../../shared/logger";
import { csvToNumberedList, isValidURL, randomInt } from "../../../utils";
import discord from "../../client";
import type { IssueCommand } from "../../types";
import { angryC18Gif, tenor } from "../../utils/gifs";
import { c18AngryQuotes } from "../../utils/quotes";
import { getColor, mentionsByScope } from "../utils";
import { embeddedIssueBuilder } from "./embedded-issue";
import { optionsDataExtractor } from "./optionsDataExtractor";

type IssueCommandParams = {
  interaction: Discord.ChatInputCommandInteraction<Discord.CacheType>;
};

export const issueCommand = async ({
  interaction,
}: IssueCommandParams): Promise<IssueCommand> => {
  const { channelId, options, user } = interaction;

  const guildUser = discord.member(user.id);
  const currentChannel = discord.channelById(channelId);
  const devRole = discord.role("dev");
  const designRole = discord.role("design");
  const issueChannel = discord.channel("issueTracking");

  const guildUserInfo = {
    name:
      guildUser?.nickname ||
      guildUser?.displayName ||
      guildUser?.user.username ||
      user.username,
    iconURL:
      guildUser?.avatarURL() ||
      guildUser?.avatar ||
      user.avatarURL() ||
      user.avatar ||
      undefined,
    mention: userMention(guildUser?.id || user.id),
    hasLabRole: discord.hasRole(guildUser?.id, "labs"),
  };

  if (currentChannel?.isThread()) {
    await interaction.reply({
      content: "I can't create threads inside threads. Sorry",
      ephemeral: true,
    });

    return undefined;
  }

  const optionData = optionsDataExtractor(options);

  const {
    type,
    title,
    component,
    specs,
    codeSnippet,
    description,
    azureWorkItem,
    attachment,
    stepsToReproduce,
    version,
    severity,
    checkTechLead,
    checkDesign,
    attachment2,
    scope,
  } = optionData;

  const fullTitle = `[${type}] ${component} - ${title}`;

  if (!isValidURL(specs) || !isValidURL(codeSnippet)) {
    const angryQuote = c18AngryQuotes[randomInt(0, c18AngryQuotes.length)];
    logger.db.discord({
      level: "warn",
      message: `isValidURL: Issue: ${fullTitle} user: ${guildUser?.displayName}`,
    });
    await interaction.reply({
      content: `Sorry, check the URLs you provided.\n Specs: "${specs}" is ${
        isValidURL(specs) ? "valid" : "invalid"
      }.\n Code: "${codeSnippet}" is ${
        isValidURL(codeSnippet) ? "valid" : "invalid"
      }. \n\n ${tenor(angryC18Gif)}\n${Discord.blockQuote(angryQuote || "")}`,
      ephemeral: true,
    });
    return undefined;
  }

  const issueSummary = embeddedIssueBuilder({
    title,
    description,
    author: {
      name: guildUserInfo.name,
      iconURL: guildUserInfo.iconURL,
    },
    azureWorkItem: isValidURL(azureWorkItem) ? azureWorkItem ?? null : null,
    attachmentUrl: attachment?.url,
    stepsToReproduce: csvToNumberedList(stepsToReproduce ?? "not provided"),
    version,
    component,
    severity,
    specs: isValidURL(specs) ? `[Figma](${specs})` : "invalid URL",
    codeSnippet: isValidURL(codeSnippet)
      ? `[Code](${codeSnippet})`
      : "invalid URL",
    checkTechLead,
    checkDesign,
  });

  await interaction
    .reply({
      content: `Thank you ${userMention(
        user.id
      )}, the team will get back to you asap.`,
      ephemeral: true,
    })
    .catch((reason) => {
      logger.db.discord({
        level: "error",
        message: `Discord:error:interaction.reply:issue ", ${reason}`,
      });
    });

  const thread = await currentChannel?.threads.create({
    name: fullTitle,
    autoArchiveDuration: Discord.ThreadAutoArchiveDuration.OneWeek,
    reason: fullTitle,
  });

  if (thread) {
    await thread?.send({
      content: mentionsByScope(scope, { dev: devRole, design: designRole }),
      embeds: [issueSummary],
    });

    if (attachment2) {
      await thread?.send({
        files: [attachment2],
      });
    }

    if (guildUserInfo.hasLabRole) {
      await issueChannel?.send({
        embeds: [
          new Discord.EmbedBuilder()
            .setTitle(title)
            .setAuthor({
              name: guildUserInfo.name,
              iconURL: guildUserInfo.iconURL,
            })
            .addFields([
              {
                name: "Thread",
                value: channelMention(thread.id),
                inline: true,
              },
              {
                name: "Author",
                value: userMention(user.id),
                inline: true,
              },
            ])
            .setColor(getColor(severity))
            .setTimestamp(),
        ],
      });
    }

    logger.db.discord({
      level: "info",
      message: `Created a thread: ${thread.name} for ${user.username}`,
    });
  } else {
    logger.db.discord({
      level: "warn",
      message: "Thread is undefined",
    });
    return undefined;
  }

  return {
    name: "issue",
    response: {
      thread,
      hasLabRole: !!guildUserInfo.hasLabRole,
      issueDetails: {
        ...optionData,
        attachment: optionData.attachment.url,
        attachment2: optionData.attachment2?.url || null,
        author: guildUserInfo.name,
        lab: currentChannel?.name || null,
        labId: "",
        discordThreadId: thread?.id,
        createdAt: new Date(),
        status: "TODO",
      },
    },
  };
};

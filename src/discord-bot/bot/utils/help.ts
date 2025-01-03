import Discord, { ForumChannel } from "discord.js";
import { startCase } from "lodash";
import logger from "../../../shared/logger";
import { derive, wait } from "../../../shared/utils";
import discord from "../client";
import { helpConstants } from "../constants";

type ValidationMessage = { errors: string[]; explanation: string[] };

const validateTitle = (title: string) => {
  const titleMatch = title.match(helpConstants.titleValidation);

  if (!titleMatch) {
    return {
      isValid: false,
      error:
        "Title is invalid. Should be *[ComponentName] - Short description*",
    } as const;
  }
  return {
    isValid: true,
  } as const;
};

const validateMessage = (message = ""): ValidationMessage => {
  const errors: string[] = [];
  const explanation: string[] = [];

  // Check for missing required sections
  for (const section of Object.keys(helpConstants.requiredSections)) {
    if (
      !helpConstants.requiredSections[
        section as keyof typeof helpConstants.requiredSections
      ].test(message)
    ) {
      errors.push(`${startCase(section)} is missing or has an invalid value.`);
    }
  }

  // Check the format of specific sections
  const stepsMatch = message.match(helpConstants.requiredSections.steps);
  if (!stepsMatch || stepsMatch.length < 2) {
    explanation.push(
      'The section "Steps to Reproduce" needs to be a list of steps, each one starting with a number followed by a colon and a space. Example: "1: Open the browser."'
    );
  }

  // Check severity options
  const severityMatch = message.match(/Severity:\s+(.*)/);

  if (!severityMatch) {
    errors.push("Severity is missing or has an invalid value");
  }

  if (
    severityMatch &&
    !helpConstants.severityOptions.includes(
      severityMatch[1] as (typeof helpConstants)["severityOptions"][number]
    )
  ) {
    errors.push("Severity has an invalid value");

    explanation.push(
      `The section "Severity" accept only [${helpConstants.severityOptions.join(
        ", "
      )}], you passed a wrong value: ${severityMatch?.[1]}.`
    );
  }

  return { errors, explanation };
};

export const safeLockThread = async (
  author: Discord.User,
  thread: Discord.ThreadChannel,
  validation: ValidationMessage
) => {
  try {
    const messageToReply = [
      author ? `Hi ${Discord.userMention(author.id)}!` : "",
      helpConstants.message,
      "\n",
      "**Errors:**",
      validation.errors.map((e) => `- ${e}`).join("\n"),
      "\n",
      "**Explanation:**",
      validation.explanation.map((e) => `- ${e}`).join("\n"),
      "\n",
      "*This thread will be archived.*",
    ];

    await thread.send(messageToReply.join("\n"));
    await thread.setAppliedTags([
      ...thread.appliedTags,
      helpConstants.tags.blocked,
    ]);
    await thread.setLocked(true, helpConstants.message);
    await thread.setArchived(true);
  } catch (err) {
    logger.console.discord({ level: "error", message: JSON.stringify(err) });
  }
};

const forceGetFirstMessage = async (thread: Discord.ThreadChannel) => {
  try {
    const message = (await thread.messages.fetch({ limit: 1 })).at(0);

    logger.console.discord({
      level: "info",
      message: `forceGetFirstMessage(): typeof:${typeof message}\n${message?.toJSON()}`,
    });

    if (!message) {
      logger.console.discord({
        level: "warn",
        message: "forceGetFirstMessage() return with undefined",
      });
    }

    return message;
  } catch (error) {
    logger.console.discord({
      level: "error",
      message: "Error forceGetFirstMessage()",
    });
    console.error("forceGetFirstMessage: ", error);
  }
};

const getStarterMessage = async (thread: Discord.ThreadChannel) => {
  try {
    const starterMessage = await thread.fetchStarterMessage();
    logger.console.discord({
      level: "info",
      message: `getStarterMessage(): typeof:${typeof starterMessage}\n${starterMessage?.toJSON()}`,
    });

    if (!starterMessage?.content) {
      return await forceGetFirstMessage(thread);
    }

    return starterMessage;
  } catch (error) {
    logger.console.discord({
      level: "error",
      message: "Error fetchStarterMessage()",
    });
    console.error("fetchStarterMessage: ", error);

    return await forceGetFirstMessage(thread);
  }
};

export const extractThreadData = async (thread: Discord.ThreadChannel) => {
  await thread.sendTyping();
  await wait(2000);
  const firstMessage = await getStarterMessage(thread);

  if (firstMessage) {
    return {
      title: thread.name,
      description: firstMessage.content,
      author:
        discord.member(firstMessage.author.id)?.displayName ||
        firstMessage.author.username,
      threadUrl: thread.url,
      message: firstMessage,
      tags: derive(() => {
        if (thread.parent instanceof ForumChannel) {
          const tags = thread.parent.availableTags;
          return tags
            .filter((tag) => thread.appliedTags.includes(tag.id))
            .map((t) => t.name);
        }
        return [];
      }),
    };
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const checkThreadGuidelines = async (thread: Discord.ThreadChannel) => {
  await thread.sendTyping();
  await wait(500);

  const data = await extractThreadData(thread);

  if (!data) {
    logger.console.discord({
      level: "warn",
      message: "warning no firstMessage",
    });
    return;
  }

  const { title, description, author, threadUrl, message } = data;

  const titleValidation = validateTitle(title);

  if (thread.appliedTags.includes(helpConstants.tags.quickQuestion)) {
    if (!titleValidation.isValid) {
      await safeLockThread(message.author, thread, {
        errors: [titleValidation.error],
        explanation: [],
      });
    }

    return;
  }

  const messageValidation = validateMessage(description);

  if (
    !titleValidation.isValid ||
    messageValidation.errors.length > 0 ||
    messageValidation.explanation.length > 0
  ) {
    await safeLockThread(message.author, thread, {
      errors: titleValidation.isValid
        ? messageValidation.errors
        : [titleValidation.error, ...messageValidation.errors],
      explanation: messageValidation.explanation,
    });
    return;
  }

  return {
    title,
    description: message.content,
    author,
    threadUrl,
  };
};

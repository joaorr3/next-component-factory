import Discord from "discord.js";
import { startCase } from "lodash";
import logger from "../../../shared/logger";
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

const getFirstMessage = async (thread: Discord.ThreadChannel) => {
  try {
    const firstMessage = await thread.fetchStarterMessage();
    if (firstMessage) {
      return firstMessage;
    }
  } catch (error) {
    logger.console.discord({
      level: "error",
      message: "Error fetchStarterMessage()",
    });
  }
};

export const checkThreadGuidelines = async (thread: Discord.ThreadChannel) => {
  const firstMessage = await getFirstMessage(thread);
  if (!firstMessage) {
    logger.console.discord({
      level: "warn",
      message: "warning no firstMessage",
    });
    return;
  }

  const titleValidation = validateTitle(thread.name);

  if (thread.appliedTags.includes(helpConstants.tags.quickQuestion)) {
    if (!titleValidation.isValid) {
      await safeLockThread(firstMessage.author, thread, {
        errors: [titleValidation.error],
        explanation: [],
      });
    }

    return;
  }

  const messageValidation = validateMessage(firstMessage?.content);

  if (
    !titleValidation.isValid ||
    messageValidation.errors.length > 0 ||
    messageValidation.explanation.length > 0
  ) {
    await safeLockThread(firstMessage.author, thread, {
      errors: titleValidation.isValid
        ? messageValidation.errors
        : [titleValidation.error, ...messageValidation.errors],
      explanation: messageValidation.explanation,
    });
    return;
  }

  return {
    title: thread.name,
    description: firstMessage.content,
    author:
      discord.member(firstMessage.author.id)?.displayName ||
      firstMessage.author.username,
    threadUrl: thread.url,
  };
};

import Discord from "discord.js";
import { startCase } from "lodash";
import logger from "../../../shared/logger";
import { helpConstants } from "../constants";

type ValidationMessage = { errors: string[]; explanation: string[] };

const validateMessage = (title: string, message = ""): ValidationMessage => {
  const errors: string[] = [];
  const explanation: string[] = [];

  // Validate title
  const titleMatch = title.match(helpConstants.titleValidation);

  if (!titleMatch) {
    errors.push(
      "Title is invalid. Should be *[ComponentName] - Short description*"
    );
  }

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
    !helpConstants.severityOptions.includes(severityMatch[1])
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
      "\n\n",
      "**Errors:**",
      validation.errors.map((e) => `- ${e}.`).join("\n"),
      "\n\n",
      "**Explanation:**",
      validation.explanation.map((e) => `- ${e}.`).join("\n"),
      "\n",
      "*This thread will be archived in one hour.*",
    ];

    await thread.send(messageToReply.join("\n"));
    await thread.setAppliedTags([
      ...thread.appliedTags,
      helpConstants.blockedTagId,
    ]);
    await thread.setAutoArchiveDuration(
      Discord.ThreadAutoArchiveDuration.OneHour
    );
    await thread.setLocked(true, helpConstants.message);
  } catch (err) {
    logger.console.discord({ level: "error", message: JSON.stringify(err) });
  }
};

export const checkThreadGuidelines = async (thread: Discord.ThreadChannel) => {
  const firstMessage = await thread.fetchStarterMessage();

  const validation = validateMessage(thread.name, firstMessage?.content);

  if (
    firstMessage &&
    (validation.errors.length > 0 || validation.explanation.length > 0)
  ) {
    await safeLockThread(firstMessage.author, thread, validation);
  }
};

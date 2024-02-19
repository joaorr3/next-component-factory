import type Discord from "discord.js";
import { helpConstants } from "../constants";
import { startCase } from "lodash";

type ValidationMessage = { errors: string[]; explains: string[] };

const validateMessage = (message: string): ValidationMessage => {
  const errors: string[] = [];
  const explains: string[] = [];

  // Check for missing required sections
  for (const section of Object.keys(helpConstants.requiredSections)) {
    if (
      !helpConstants.requiredSections[
        section as keyof typeof helpConstants.requiredSections
      ].test(message)
    ) {
      errors.push(`${startCase(section)} is missing or has an invalid value`);
    }
  }

  // Check format of specific sections
  const stepsMatch = message.match(helpConstants.requiredSections.steps);
  if (!stepsMatch || stepsMatch.length < 2) {
    explains.push(
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

    explains.push(
      `The section "Severity" accept only [${helpConstants.severityOptions.join(
        ", "
      )}], you passed a wrong value: ${severityMatch?.[1]}.`
    );
  }

  return { errors, explains };
};

export const safeLockThread = async (
  thread: Discord.ThreadChannel,
  validation: ValidationMessage
) => {
  try {
    const messageToReply = [
      helpConstants.message,
      "\n\n**Errors:**",
      validation.errors.map((e) => `- ${e}`).join("\n"),
      "\n\n**Explains:**",
      validation.explains.map((e) => `- ${e}`).join("\n"),
    ];

    await thread.send(messageToReply.join("\n"));
    await thread.setAppliedTags([
      ...thread.appliedTags,
      helpConstants.blockedTagId,
    ]);
    await thread.setLocked(true, helpConstants.message);
  } catch (err) {}
};

export const checkThreadGuidelines = async (thread: Discord.ThreadChannel) => {
  const messages = (await thread.messages.fetch({ limit: 1 })) ?? [];
  const firstMessage = messages.map((m) => m.content).join(" ");

  const validation = validateMessage(firstMessage);

  if (validation.errors.length > 0 || validation.explains.length > 0) {
    await safeLockThread(thread, validation);
  }
};

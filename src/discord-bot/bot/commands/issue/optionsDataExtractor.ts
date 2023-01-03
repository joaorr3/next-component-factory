import type Discord from "discord.js";
import type { OptionsDataExtractorModel } from "../../../models";
import { IssueCommandOptions } from "../enums";

export const optionsDataExtractor = (
  options: Omit<
    Discord.CommandInteractionOptionResolver<Discord.CacheType>,
    "getMessage" | "getFocused"
  >
): OptionsDataExtractorModel => {
  return {
    title: options.getString(IssueCommandOptions.title, true),
    description: options.getString(IssueCommandOptions.description, true),
    version: options.getString(IssueCommandOptions.version, true),
    type: options.getString(IssueCommandOptions.type, true),
    stepsToReproduce: options.getString(IssueCommandOptions.steps, true),
    component: options.getString(IssueCommandOptions.component, true),
    severity: options.getString(IssueCommandOptions.severity, true),
    specs: options.getString(IssueCommandOptions.specs, true),
    codeSnippet: options.getString(IssueCommandOptions.snippet, true),
    checkTechLead: options.getBoolean(IssueCommandOptions.techlead, true),
    checkDesign: options.getBoolean(IssueCommandOptions.design, true),
    scope: options.getString(IssueCommandOptions.scope, true),
    attachment: options.getAttachment(IssueCommandOptions.attachment, true),
    attachment2: options.getAttachment(IssueCommandOptions.attachment2),
    azureWorkItem: options.getString(IssueCommandOptions.azure_work_item),
  };
};

import Discord from "discord.js";
import type { CommandName } from "../types";
import {
  IssueCommandOptions,
  IssueScope,
  IssueSeverityLevel,
  IssueType,
} from "./enums";

export const command = (name: CommandName) =>
  new Discord.SlashCommandBuilder()
    .setName(name)
    .setDescription(`Command: ${name}`);

export const issueCheckTechLeadBooleanOption = () => {
  return (option: Discord.SlashCommandBooleanOption) =>
    option
      .setName(IssueCommandOptions.techlead)
      .setDescription("Did you discuss this issue with your Tech Lead?")
      .setRequired(true);
};

export const issueCheckDesignerBooleanOption = () => {
  return (option: Discord.SlashCommandBooleanOption) =>
    option
      .setName(IssueCommandOptions.design)
      .setDescription("Did you discuss this issue with your Design Team?")
      .setRequired(true);
};

export const issueFigmaStringOption = () => {
  return (option: Discord.SlashCommandStringOption) =>
    option
      .setName(IssueCommandOptions.specs)
      .setDescription("ex: https://www.figma.com/file/...")
      .setRequired(true);
};

export const issueCodeSnippetStringOption = () => {
  return (option: Discord.SlashCommandStringOption) =>
    option
      .setName(IssueCommandOptions.snippet)
      .setDescription(
        "Code Snippet: Ex: https://dev.azure.com/ptbcp/UCA/_git/repo?path=/path/to/your/file"
      )
      .setRequired(true);
};

export const issueComponentStringOption = () => {
  return (option: Discord.SlashCommandStringOption) =>
    option
      .setName(IssueCommandOptions.component)
      .setDescription(
        "Make sure you insert an exact match. Correct: InputSelect | Wrong: SelectInput, input Select, etc.."
      )
      .setRequired(true);
};

export const issueScopeStringOptions = () => {
  return (option: Discord.SlashCommandStringOption) =>
    option
      .setName(IssueCommandOptions.scope)
      .setDescription("Who should be notified?")
      .setRequired(true)
      .addChoices(
        {
          name: IssueScope.dev,
          value: IssueScope.dev,
        },
        {
          name: IssueScope.design,
          value: IssueScope.design,
        },
        {
          name: IssueScope.both,
          value: IssueScope.both,
        }
      );
};

export const issueTypeStringOptions = () => {
  return (option: Discord.SlashCommandStringOption) =>
    option
      .setName(IssueCommandOptions.type)
      .setDescription("Issue type")
      .setRequired(true)
      .addChoices(
        {
          name: IssueType.bug,
          value: IssueType.bug,
        },
        {
          name: IssueType.cr,
          value: IssueType.cr,
        },
        {
          name: IssueType.feat,
          value: IssueType.feat,
        },
        {
          name: IssueType.help,
          value: IssueType.help,
        }
      );
};

export const issueSeverityStringOptions = (required = true) => {
  return (option: Discord.SlashCommandStringOption) =>
    option
      .setName(IssueCommandOptions.severity)
      .setDescription("How severe is the bug.")
      .setRequired(required)
      .addChoices(
        {
          name: IssueSeverityLevel.high,
          value: IssueSeverityLevel.high,
        },
        {
          name: IssueSeverityLevel.medium,
          value: IssueSeverityLevel.medium,
        },
        {
          name: IssueSeverityLevel.low,
          value: IssueSeverityLevel.low,
        }
      );
};

export const issueStepsToReproduceStringOptions = () => {
  return (option: Discord.SlashCommandStringOption) =>
    option
      .setName(IssueCommandOptions.steps)
      .setDescription(
        "Steps to reproduce: Provide a CVS like string. Ex: Did this; Did that;"
      )
      .setRequired(true);
};

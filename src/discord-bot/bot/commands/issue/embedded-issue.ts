import Discord from "discord.js";
import type { EmbeddedIssueBuilderModel } from "../../../models";
import { getColor } from "../utils";

const np = "not provided";

export const embeddedIssueBuilder = ({
  title,
  description,
  author,
  azureWorkItem,
  attachmentUrl,
  stepsToReproduce,
  version,
  component,
  severity,
  specs,
  codeSnippet,
  checkTechLead,
  checkDesign,
}: EmbeddedIssueBuilderModel) => {
  const embeddedIssue = new Discord.EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setAuthor({
      name: author.name,
      iconURL: author.iconURL,
    })
    .setURL(azureWorkItem)
    .setImage(attachmentUrl)
    .addFields([
      {
        name: "Steps to reproduce",
        value: stepsToReproduce || np,
      },
      { name: "\u200B", value: "\u200B" },
    ])
    .addFields([
      {
        name: "Version",
        value: version || np,
        inline: true,
      },
      {
        name: "Component",
        value: component || np,
        inline: true,
      },
      {
        name: "Severity",
        value: severity || np,
        inline: true,
      },
    ])
    .addFields([
      {
        name: "Specs",
        value: specs || np,
        inline: true,
      },
      {
        name: "Code Snippet",
        value: codeSnippet || np,
        inline: true,
      },
    ])
    .addFields([
      {
        name: "Checked with TechLead",
        value: checkTechLead ? "yes" : "no",
        inline: true,
      },
      {
        name: "Checked with Design",
        value: checkDesign ? "yes" : "no",
        inline: true,
      },
    ])
    .setFooter({
      text: "Thank you",
    })
    .setColor(getColor(severity))
    .setTimestamp();

  return embeddedIssue;
};

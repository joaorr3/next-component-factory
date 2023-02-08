import Discord, { roleMention } from "discord.js";
import { IssueScope } from "../../../shared/enums";
import { IssueSeverityLevel } from "./enums";

export const getPrUrl = (id?: string) =>
  `https://dev.azure.com/ptbcp/IT.Ignite/_git/BCP.Ignite.Dx.ComponentFactory/pullrequest/${id}`;

export const getArtifactUrl = (id?: string) =>
  `https://dev.azure.com/ptbcp/IT.Ignite/_artifacts/feed/BCP.Ignite.Dx.ComponentFactory/Npm/@bcp-nextgen-dx-component-factory%2Faccolade-design-system/overview/${id}`;

export const npmInstallHint = (version?: string) =>
  `npm install @bcp-nextgen-dx-component-factory/accolade-design-system@${version}`;

export const getColor = (severity?: string | null) => {
  switch (severity) {
    case IssueSeverityLevel.high:
      return Discord.Colors.Red;
    case IssueSeverityLevel.medium:
      return Discord.Colors.Yellow;
    case IssueSeverityLevel.low:
      return Discord.Colors.Green;
    default:
      return Discord.Colors.Gold;
  }
};

export const mentionsByScope = (
  scope: string | null,
  roles: { dev?: Discord.Role; design?: Discord.Role }
) => {
  if (roles.dev && roles.design) {
    switch (scope) {
      case IssueScope.dev:
        return roleMention(roles.dev.id);
      case IssueScope.design:
        return roleMention(roles.design.id);
      case IssueScope.both:
      default:
        return `${roleMention(roles.dev.id)} ${roleMention(roles.design.id)}`;
    }
  }
};

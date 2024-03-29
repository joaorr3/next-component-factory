import type { GuildUser } from "@prisma/client";
import type Discord from "discord.js";
import type { IssueSeverityLevel } from "../../shared/enums";
import type { IssueDetailsModel } from "../../shared/models";

export type ChannelType =
  | Discord.ChannelType.GuildText
  | Discord.ChannelType.GuildVoice
  | Discord.ChannelType.GuildCategory
  | Discord.ChannelType.GuildPublicThread;

export type RegisterCommandsArgs = {
  discordBotToken: string;
  discordClientId: string;
  guildId: string;
};

export type IssueInfo = {
  component: string | undefined;
  severity: IssueSeverityLevel | undefined;
  version: string | undefined;
  scope: string | undefined;
  figma: string | undefined;
  checkTechLead: boolean | undefined;
  checkDesigner: boolean | undefined;
};

export type Roles =
  | "LABS 🧪"
  | "m2030"
  | "mse"
  | "chatbot"
  | "izibizi"
  | "shopping"
  | "dmm"
  | "apparte"
  | "investments-savings"
  | "gip"
  | "credit-experience"
  | "e-commerce"
  | "Visitors 👽"
  | "personal-credit"
  | "T4G";

export type CommandName =
  | "ping"
  | "gif"
  | "quote"
  | "issue"
  | "issue_legacy"
  | "roles"
  | "pr"
  | "archive"
  | "publish"
  | "assign"
  | "notion_batch_update"
  | "kudos"
  | "list_kudos"
  | "sync_guild_users"
  | "announce"
  | "schedules";

type IssueCommandModel = {
  thread?: Discord.ThreadChannel<boolean>;
  hasLabRole: boolean;
  issueDetails: IssueDetailsModel;
};

type PingCommand = {
  name: "ping";
  response: undefined;
};

type GifCommand = {
  name: "gif";
  response: undefined;
};

type QuoteCommand = {
  name: "quote";
  response: undefined;
};

type IssueCommand = {
  name: "issue";
  response: undefined;
};

export type IssueLegacyCommand =
  | {
      name: "issue_legacy";
      response: IssueCommandModel;
    }
  | undefined;

type RolesCommand =
  | {
      name: "roles";
      response: undefined;
    }
  | undefined;

type PrCommand =
  | {
      name: "pr";
      response: undefined;
    }
  | undefined;

type ArchiveCommand = {
  name: "archive";
  response: { threadId?: string };
};

type PublishCommand =
  | {
      name: "publish";
      response: undefined;
    }
  | undefined;

type AssignCommand =
  | {
      name: "assign";
      response: {
        thread?: Discord.AnyThreadChannel;
        user: Discord.User;
        assignee?: Discord.User;
      };
    }
  | undefined;

type NotionBatchUpdateCommand =
  | {
      name: "notion_batch_update";
      response: {
        isAllowed: boolean;
        start_date?: string;
        end_date?: string;
      };
    }
  | undefined;

export type KudosCommandResponse = {
  from: Discord.User;
  to: Discord.User;
  type: string;
};

type KudosCommand =
  | {
      name: "kudos";
      response: KudosCommandResponse;
    }
  | undefined;

type ListKudosCommand =
  | {
      name: "list_kudos";
      response: { channel?: Discord.TextChannel | null };
    }
  | undefined;

type SyncGuildUsersCommand =
  | {
      name: "sync_guild_users";
      response: { guildUsers: GuildUser[] };
    }
  | undefined;

type AnnounceCommand =
  | {
      name: "announce";
      response: undefined;
    }
  | undefined;

type SchedulesCommand =
  | {
      name: "schedules";
      response: undefined;
    }
  | undefined;

export type DiscordCommandObject = {
  ping: () => Promise<PingCommand>;
  gif: () => Promise<GifCommand>;
  quote: () => Promise<QuoteCommand>;
  issue: () => Promise<IssueCommand>;
  issue_legacy: () => Promise<IssueLegacyCommand>;
  roles: () => Promise<RolesCommand>;
  pr: () => Promise<PrCommand>;
  archive: () => Promise<ArchiveCommand>;
  publish: () => Promise<PublishCommand>;
  assign: () => Promise<AssignCommand>;
  notion_batch_update: () => Promise<NotionBatchUpdateCommand>;
  kudos: () => Promise<KudosCommand>;
  list_kudos: () => Promise<ListKudosCommand>;
  sync_guild_users: () => Promise<SyncGuildUsersCommand>;
  announce: () => Promise<AnnounceCommand>;
  schedules: () => Promise<SchedulesCommand>;
};

export type CommandReactionsArgs = {
  commandName: CommandName;
  client: Discord.Client;
  interaction: Discord.Interaction<Discord.CacheType>;
};

export type CommandReactions = (
  args: CommandReactionsArgs
) => Promise<CommandsResponse> | undefined;

export type CommandsResponse = Promise<
  | PingCommand
  | GifCommand
  | QuoteCommand
  | IssueCommand
  | IssueLegacyCommand
  | RolesCommand
  | PrCommand
  | ArchiveCommand
  | PublishCommand
  | AssignCommand
  | NotionBatchUpdateCommand
  | KudosCommand
  | ListKudosCommand
  | SyncGuildUsersCommand
  | AnnounceCommand
  | SchedulesCommand
>;

export type KudosType = {
  type: string;
  description: string;
};

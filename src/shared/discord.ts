import type { GuildUser } from "@prisma/client";
import Discord, {
  ChannelType,
  GatewayIntentBits,
  Partials,
  roleMention,
  userMention,
  type Awaitable,
  type ClientEvents,
} from "discord.js";
import { DataUtils } from "../discord-bot/data";
import { env } from "../env/server";
import { ServiceErrorHandler } from "../utils/error";
import { prismaSharedClient } from "./prisma/client";
import { promisify } from "./utils";

export const channelNames = {
  welcome: "welcome",
  pr: "pr-approvals",
  releases: "releases",
  issueTracking: "issue-tracking",
  issueValidation: "issue-validation",
  workItem: "work-item",
  botLogs: "bot-logs",
  debugBotLogs: "debug-bot-logs",
  webhookLogs: "webhook-logs",
  roles: "roles",
  introductions: "introductions",
  manageRoles: "manage-roles",
} as const;

// type ChanelNamesModel = typeof channelNames;

const roleNames = {
  admin: "Admin",
  mods: "mods",
  cf: "CF 🏭",
  projectManager: "Project Manager 📁",
  dev: "DEV-CF 👨‍💻",
  design: "Design 🎨",
  labs: "DEV-LABS 🧪",
  issueValidation: "issue-validation",
  techLead: "tech-lead",
  visitor: "Visitor 👽",
} as const;

type RoleNameModels = typeof roleNames;

export class DiscordClient {
  public client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildEmojisAndStickers,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildMessageReactions,
      GatewayIntentBits.GuildWebhooks,
    ],

    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  });

  public guild: Discord.Guild | undefined;

  public readonly channelNames = channelNames;

  public readonly roleNames = roleNames;

  private static _instance: DiscordClient = new DiscordClient();

  private constructor() {
    this.start();
  }

  public start() {
    console.log("DiscordClient.start");
    this.client.login(env.DISCORD_BOT_TOKEN);

    this.client.once(Discord.Events.ClientReady, () => {
      this.setGuild();
    });
  }

  public destroy() {
    console.log("DiscordClient.destroy");
    this.client.destroy();
  }

  public static get Instance(): DiscordClient {
    return this._instance;
  }

  public once<K extends keyof ClientEvents>(
    event: K,
    listener: (...args: ClientEvents[K]) => Awaitable<void>
  ) {
    this.client?.once(event, listener);
  }

  public on<K extends keyof ClientEvents>(
    event: K,
    listener: (...args: ClientEvents[K]) => Awaitable<void>
  ) {
    this.client?.on(event, listener);
  }

  private setGuild() {
    this.guild = this.client.guilds.cache.find(
      ({ name }) => name === env.GUILD_NAME
    );
  }

  private findChannel(cb: (ch: Discord.GuildBasedChannel) => boolean) {
    return this.guild?.channels.cache.find(cb);
  }

  public embed(info: Discord.EmbedData) {
    return new Discord.EmbedBuilder(info).setColor("Gold").setTimestamp();
  }

  public channel(name: keyof typeof this.channelNames | (string & {})) {
    const ch = this.findChannel(
      (ch) =>
        ch.name ===
        (this.channelNames[name as keyof typeof this.channelNames] || name)
    );

    if (
      ch?.type === ChannelType.GuildText ||
      ch?.type === ChannelType.GuildVoice
    ) {
      return ch;
    }
    return undefined;
  }

  public channelById(id: string) {
    const ch = this.findChannel((ch) => ch.id === id);

    if (ch?.type === ChannelType.GuildText) {
      return ch;
    }
    return undefined;
  }

  public threadById(id: string) {
    const ch = this.findChannel((ch) => ch.id === id);

    if (ch?.isThread() && ch?.type === ChannelType.PublicThread) {
      return ch;
    }
    return undefined;
  }

  public role(name: keyof typeof this.roleNames) {
    return this.guild?.roles.cache.find((r) => r.name === this.roleNames[name]);
  }

  public roleById(roleId?: string) {
    return this.guild?.roles.cache.find((r) => r.id === roleId);
  }

  public hasRole(
    memberId: string | undefined,
    name: keyof typeof this.roleNames
  ) {
    if (memberId) {
      const member = this.member(memberId);
      const role = this.role(name);
      if (role && member) {
        return member.roles.cache.has(role.id);
      }
    }

    return false;
  }

  public mention({
    userId,
    roles,
  }: {
    userId?: string | string[];
    roles?: keyof RoleNameModels | (keyof RoleNameModels)[];
  }) {
    const type = !!roles ? "role" : "user";

    const mentionFn = !!roles ? roleMention : userMention;
    const mentionsIds: string[] = [];

    if (type === "role" && !!roles) {
      if (Array.isArray(roles)) {
        for (const roleName of roles) {
          const role = this.role(roleName);
          if (role) {
            mentionsIds.push(role.id);
          }
        }
      } else {
        const role = this.role(roles);
        if (role) {
          mentionsIds.push(role.id);
        }
      }
    } else if (type === "user" && !!userId) {
      if (Array.isArray(userId)) {
        for (const id of userId) {
          mentionsIds.push(id);
        }
      } else {
        mentionsIds.push(userId);
      }
    }

    const mentionString = mentionsIds.map((m) => mentionFn(m)).join(" ");

    return mentionString;
  }

  @ServiceErrorHandler({ code: "DISCORD", message: "getAutoAssignableRoles" })
  public async getAutoAssignableRoles() {
    return await prismaSharedClient.roles.autoAssignable();
  }

  @ServiceErrorHandler({ code: "DISCORD", message: "roleIsAutoAssignable" })
  public async roleIsAutoAssignable(_role?: Discord.Role) {
    const autoAssignable = await this.getAutoAssignableRoles();
    const role = autoAssignable.find((r) => r.id === _role?.id);
    return {
      isAutoAssignable: Boolean(role && role.isAutoAssignable),
      autoAssignableRoles: autoAssignable,
    };
  }

  public hasRoleById(memberId: string | undefined, roleId: string | undefined) {
    if (memberId) {
      const member = this.member(memberId);
      const role = this.roleById(roleId);
      if (role && member) {
        return member.roles.cache.has(role.id);
      }
    }

    return false;
  }

  public member(memberId: string) {
    return this.guild?.members.cache.find((m) => m.id === memberId);
  }

  @ServiceErrorHandler({ code: "DISCORD", message: "fetchMembers" })
  public async fetchMembers() {
    const rawMembersData = await this.guild?.members.fetch();
    if (rawMembersData) {
      const guildUsers: GuildUser[] = rawMembersData.map(
        DataUtils.transformGuildMemberData
      );

      return guildUsers;
    }
    return [];
  }

  @ServiceErrorHandler({ code: "DISCORD", message: "sendMessage" })
  public async sendMessage(
    name: keyof typeof this.channelNames | (string & {}),
    message: Discord.BaseMessageOptions
  ) {
    await this.client.guilds.fetch();
    const channel = this.channel(name);
    if (!channel) return;

    await channel.send(message);
  }

  /**
   * Doesn't need an async/await context
   */
  public logger(name: keyof typeof this.channelNames) {
    return (messageFn: () => Discord.BaseMessageOptions) => {
      const message: Discord.BaseMessageOptions = messageFn();
      promisify(() => this.sendMessage(name, message), message.content);
    };
  }
}

export const discordSharedClient = DiscordClient.Instance;

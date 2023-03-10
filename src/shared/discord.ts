import Discord, {
  ChannelType,
  GatewayIntentBits,
  Partials,
  type Awaitable,
  type ClientEvents,
} from "discord.js";
import { env } from "../env/server";
import { prismaSharedClient } from "./prisma/client";
import { promisify } from "./utils";

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

  public readonly channelNames = {
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
  } as const;

  public readonly roleNames = {
    admin: "Admin",
    cf: "CF ๐ญ",
    dev: "DEV ๐จโ๐ป",
    design: "Design ๐จ",
    labs: "LABS ๐งช",
    issueValidation: "issue-validation",
    techLead: "tech-lead",
    visitor: "Visitors ๐ฝ",
  } as const;

  private static _instance: DiscordClient = new DiscordClient();

  private constructor() {
    this.client.login(env.DISCORD_BOT_TOKEN);

    this.client.once(Discord.Events.ClientReady, () => {
      this.setGuild();
    });
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

  public channel(name: keyof typeof this.channelNames) {
    const ch = this.findChannel((ch) => ch.name === this.channelNames[name]);
    if (ch?.type === ChannelType.GuildText) {
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

  public async roleIsAutoAssignable(_role?: Discord.Role) {
    const autoAssignable = await prismaSharedClient.roles.autoAssignable();
    const role = autoAssignable.find((r) => r.id === _role?.id);
    return Boolean(role && role.isAutoAssignable);
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

  public async sendMessage(
    name: keyof typeof this.channelNames,
    message: Discord.BaseMessageOptions
  ) {
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

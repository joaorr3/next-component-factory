import { REST } from "@discordjs/rest";
import type { GuildUser } from "@prisma/client";
import Discord, {
  ChannelType,
  roleMention,
  Routes,
  userMention,
} from "discord.js";
import { camelCase } from "lodash";
import cron from "node-cron";
import { env } from "../../../env/server";
import logger from "../../../shared/logger";
import { derive } from "../../../shared/utils";
import { DataUtils } from "../../data";
import { randomInt } from "../../utils";
import discord from "../client";
import { kudosTypes } from "../constants";
import type {
  CommandReactionsArgs,
  CommandsResponse,
  DiscordCommandObject,
} from "../types";
import { BotLog, getGuild, visitorRole } from "../utils";
import { c18Gif, tenor } from "../utils/gifs";
import { c18Quotes } from "../utils/quotes";
import {
  command,
  issueCheckDesignerBooleanOption,
  issueCheckTechLeadBooleanOption,
  issueCodeSnippetStringOption,
  issueComponentStringOption,
  issueFigmaStringOption,
  issueScopeStringOptions,
  issueSeverityStringOptions,
  issueStepsToReproduceStringOptions,
  issueTypeStringOptions,
} from "./builders";
import { versionHint } from "./constants";
import {
  Announce,
  AssignOption,
  BatchOptions,
  IssueCommandOptions,
  KudosOption,
  PrOption,
  PrSizeOption,
  RoleAction,
  ThreadArchiveOption,
  ThreadArchiveOptionChoices,
} from "./enums";
import { issueCommand } from "./issue/issue-command";
import { getArtifactUrl, getPrUrl, npmInstallHint } from "./utils";

//region Command Register
export const registerCommands = () => {
  const commands = [
    command("ping"),
    command("gif"),
    command("quote"),
    command("issue"),
    command("issue_legacy")
      .addStringOption(issueTypeStringOptions())
      .addBooleanOption(issueCheckTechLeadBooleanOption())
      .addBooleanOption(issueCheckDesignerBooleanOption())
      .addStringOption(issueComponentStringOption())
      .addStringOption((option) =>
        option
          .setName(IssueCommandOptions.title)
          .setDescription("Title")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName(IssueCommandOptions.description)
          .setDescription("A brief description of your question.")
          .setMinLength(20)
          .setRequired(true)
      )
      .addStringOption(issueStepsToReproduceStringOptions())
      .addStringOption((option) =>
        option
          .setName(IssueCommandOptions.version)
          .setDescription(`The package version: ${versionHint}`)
          .setRequired(true)
      )
      .addStringOption(issueFigmaStringOption())
      .addStringOption(issueCodeSnippetStringOption())
      .addStringOption(issueScopeStringOptions())
      .addStringOption(issueSeverityStringOptions())
      .addAttachmentOption((option) =>
        option
          .setName(IssueCommandOptions.attachment)
          .setDescription(
            "Screenshots are very useful, as they allows us to quickly understand the context."
          )
          .setRequired(true)
      )
      .addAttachmentOption((option) =>
        option
          .setName(IssueCommandOptions.attachment2)
          .setDescription("Optional screenshot")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName(IssueCommandOptions.azure_work_item)
          .setDescription("Azure DevOps work item link. It's optional.")
          .setRequired(false)
      ),
    command("roles")
      .addStringOption((option) =>
        option
          .setName("action")
          .setDescription("What do you want to do?")
          .setRequired(true)
          .addChoices(
            { name: RoleAction.list, value: RoleAction.list },
            { name: RoleAction.get, value: RoleAction.get },
            { name: RoleAction.remove, value: RoleAction.remove }
          )
      )
      .addRoleOption((option) =>
        option
          .setName("role")
          .setDescription(
            "You probably want LABS and the role of the project you're working on."
          )
          .setRequired(false)
      ),
    command("pr")
      .addStringOption((option) =>
        option
          .setName(PrOption.title)
          .setDescription("Probably the name of the component?")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName(PrOption.id)
          .setDescription("The PR ID from Azure DevOps.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName(PrOption.size)
          .setDescription("The size of the PR. This is subjective.")
          .setRequired(true)
          .addChoices(
            {
              name: PrSizeOption.sm,
              value: PrSizeOption.sm,
            },
            {
              name: PrSizeOption.md,
              value: PrSizeOption.md,
            },
            {
              name: PrSizeOption.lg,
              value: PrSizeOption.lg,
            }
          )
      ),
    command("archive").addStringOption((option) =>
      option
        .setName(ThreadArchiveOption.duration)
        .setDescription("When should i archive this thread? Default is 1h.")
        .setRequired(false)
        .addChoices(
          {
            name: ThreadArchiveOptionChoices.now,
            value: "now",
          },
          {
            name: ThreadArchiveOptionChoices["1h"],
            value: String(Discord.ThreadAutoArchiveDuration.OneHour),
          },
          {
            name: ThreadArchiveOptionChoices["1d"],
            value: String(Discord.ThreadAutoArchiveDuration.OneDay),
          }
        )
    ),
    command("publish").addStringOption((option) =>
      option
        .setName(IssueCommandOptions.version)
        .setDescription(
          "The package version. Leave empty if latest, it will redirect automatically."
        )
        .setRequired(false)
    ),
    command("assign").addUserOption((option) =>
      option
        .setName(AssignOption.assignee)
        .setRequired(false)
        .setDescription(
          "The person responsible for doing the work. If not provided, this issue will be assigned to you."
        )
    ),
    command("notion_batch_update")
      .addStringOption((option) =>
        option.setName(BatchOptions.start_date).setDescription("DD/MM/YYYY")
      )
      .addStringOption((option) =>
        option.setName(BatchOptions.end_date).setDescription("DD/MM/YYYY")
      ),
    command("kudos")
      .addUserOption((option) =>
        option
          .setName(KudosOption.to)
          .setRequired(true)
          .setDescription("Who do you want to send this Kudos?")
      )
      .addStringOption((option) =>
        option
          .setName(KudosOption.type)
          .setRequired(true)
          .setDescription("Choose one from the list.")
          .addChoices(
            ...kudosTypes.map((k) => ({
              name: camelCase(k.type),
              value: camelCase(k.type),
            }))
          )
      )
      .addBooleanOption((option: Discord.SlashCommandBooleanOption) =>
        option
          .setName(KudosOption.public)
          .setDescription(
            "By default the kudos you send are anonymous. Choose true to let them know it was you."
          )
          .setRequired(false)
      ),

    command("list_kudos"),
    command("sync_guild_users"),
    command("schedules"),
    command("announce")
      .addStringOption((option) =>
        option.setName(Announce.title).setDescription("Announcement title")
      )
      .addStringOption((option) =>
        option
          .setName(Announce.announcement)
          .setDescription("Text body")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName(Announce.extra)
          .setDescription("Content to be sent separately from the embed")
          .setRequired(false)
      )
      .addRoleOption((option) =>
        option
          .setName(Announce.mention)
          .setDescription("Announcement role to mention.")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName(Announce.url)
          .setDescription("Announcement URL")
          .setRequired(false)
      )
      .addAttachmentOption((option) =>
        option
          .setName(Announce.attachment)
          .setDescription("Attachment")
          .setRequired(false)
      ),
  ].map((command) => command.toJSON());

  const rest = new REST({ version: "10" }).setToken(env.DISCORD_BOT_TOKEN);

  rest
    .put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.GUILD_ID), {
      body: commands,
    })
    .then(() => {
      logger.console.discord({
        level: "info",
        message: "Successfully registered application commands.",
      });
    })
    .catch(console.error);
};

//endregion

//region Command Reactions
export const commandReactions = async ({
  client,
  interaction,
  commandName,
}: CommandReactionsArgs): Promise<CommandsResponse | undefined> => {
  const guild = getGuild(client);
  if (!guild || !interaction.isChatInputCommand()) return undefined;

  const commands: DiscordCommandObject = {
    ping: async () => {
      await interaction.reply("Pong!");
      return {
        name: "ping",
        response: undefined,
      };
    },
    gif: async () => {
      await interaction.reply({
        content: tenor(c18Gif[randomInt(0, c18Gif.length)]),
      });
      return {
        name: "gif",
        response: undefined,
      };
    },
    quote: async () => {
      const quote = c18Quotes[randomInt(0, c18Quotes.length)];

      if (quote) {
        await interaction.reply({
          content: Discord.blockQuote(quote),
        });
      }
      return {
        name: "quote",
        response: undefined,
      };
    },
    issue: async () => {
      await interaction.reply({
        content: `${env.NEXT_PROD_URL}/issue/open \n or https://next-cf-up.vercel.app/issue/open`,
      });
      return {
        name: "issue",
        response: undefined,
      };
    },
    issue_legacy: async () => await issueCommand({ interaction }),
    roles: async () => {
      const { options, user } = interaction;
      const action = options.getString("action") as RoleAction;
      const guildUser = discord.member(user.id);
      const role = options.getRole("role") as Discord.Role;
      const guildAdminRole = discord.role("admin");

      try {
        if (action === RoleAction.list) {
          const autoAssignableRolesName = (
            await discord.getAutoAssignableRoles()
          ).map(({ name }) => name);

          const info = [
            "Here's a list of the roles you can assign to yourself with the **/roles** command.\n",
            autoAssignableRolesName
              .map((r) => `• ${r}`)
              .sort((a, b) => a.localeCompare(b))
              .join("\n"),
          ];

          await interaction.reply({
            content: info.join("\n"),
            ephemeral: true,
          });

          return {
            name: "roles",
            response: undefined,
          };
        }

        const hasAlreadyThisRole = discord.hasRoleById(guildUser?.id, role.id);

        const { isAutoAssignable, autoAssignableRoles } =
          await discord.roleIsAutoAssignable(role);

        if (isAutoAssignable && guildUser) {
          if (action === RoleAction.get) {
            if (hasAlreadyThisRole) {
              await interaction.reply({
                content: `You already have the role ${role?.name}.`,
                ephemeral: true,
              });
              return undefined;
            }
            await interaction.reply({
              content: `Great, the role ${role?.name} will be assigned to you. Later.`,
              ephemeral: true,
            });

            await guildUser.roles.add(role);

            await visitorRole({
              action: RoleAction.remove,
              userId: user.id,
            });

            await discord.sendMessage("manageRoles", {
              content: `Hey, ${roleMention(
                guildAdminRole?.id ?? ""
              )}, ${userMention(user.id)} auto assigned the role ${roleMention(
                role.id
              )}.`,
            });

            logger.db.discord({
              level: "info",
              message: `Assigned ${role.name} to ${guildUser.displayName}`,
            });
          } else if (action === RoleAction.remove) {
            if (!hasAlreadyThisRole) {
              // If the user tries to remove a role that it doesn't have,
              await interaction.reply({
                content: `You don't have the role ${role?.name}.`,
                ephemeral: true,
              });
              return undefined;
            }
            await interaction.reply({
              content: `Sure, i'll remove the role ${role?.name}. Bye`,
              ephemeral: true,
            });

            await guildUser.roles.remove(role);

            logger.db.discord({
              level: "info",
              message: `Remove ${role.name} role from ${guildUser.displayName}`,
            });
          }
        } else {
          const rolesName = autoAssignableRoles.map(({ name }) => name);

          const info = [
            `Sorry, i'm not allowed to assign the role ${role?.name} to you. Don't worry, i'll notify an admin.\n`,
            "Here's a list of the roles you can assign to yourself with the **/roles** command.\n",
            rolesName
              .map((r) => `• ${r}`)
              .sort((a, b) => a.localeCompare(b))
              .join("\n"),
          ];

          await discord.sendMessage("manageRoles", {
            content: `Hey, ${roleMention(
              guildAdminRole?.id ?? ""
            )}, ${userMention(user.id)} is asking for the role ${roleMention(
              role.id
            )}.`,
          });

          await interaction.reply({
            content: info.join("\n"),
            ephemeral: true,
          });
        }
      } catch (error) {
        await interaction.reply({
          content: `Sorry, something went wrong with me. Try again later.. 😔`,
          ephemeral: true,
        });

        logger.db.discord({
          level: "error",
          message: `roles: ${error}`,
        });
      }

      return {
        name: "roles",
        response: undefined,
      };
    },
    pr: async () => {
      const { options, user } = interaction;

      const prChannel = discord.channel("pr");
      const guildDevRole = discord.role("dev");
      const userHasDevRole = discord.hasRole(user.id, "dev");

      if (prChannel?.isThread()) {
        await interaction.reply({
          content: "This is already a thread.",
          ephemeral: true,
        });
        return undefined;
      }

      if (!userHasDevRole) {
        await interaction.reply({
          content: `Sorry, only CF dev's can create PR's.`,
          ephemeral: true,
        });
        return undefined;
      }

      const title = options.getString(PrOption.title) ?? undefined;
      const pr_id = options.getString(PrOption.id) ?? undefined;
      const pr_size = options.getString(PrOption.size) ?? undefined;

      const prUrl = getPrUrl(pr_id);

      const fullTitle = `[${pr_size} - ${title}] - ${pr_id}`;

      if (prChannel && prChannel.type === ChannelType.GuildText) {
        logger.db.discord({
          level: "info",
          message: `Discord: Created PR: ${title} for ${user.username}`,
        });

        await interaction.reply({
          content: `Hi ${userMention(user.id)}, thank you for opening a PR.`,
          ephemeral: true,
        });

        const thread = await prChannel.threads.create({
          name: fullTitle,
          autoArchiveDuration: Discord.ThreadAutoArchiveDuration.OneWeek,
          reason: fullTitle,
        });

        const issueSummary = discord.embed({
          title,
          url: prUrl,
          author: {
            name: user.username,
            iconURL: user.avatarURL() ?? user.avatar ?? "",
          },
          footer: {
            text: "Nice job!",
          },
        });

        await thread?.send({
          content: guildDevRole ? roleMention(guildDevRole.id) : undefined,
          embeds: [issueSummary],
        });
      }

      return {
        name: "pr",
        response: undefined,
      };
    },
    archive: async () => {
      const { channelId, options } = interaction;

      const currentThread = discord.threadById(channelId);

      const isThread = currentThread?.isThread();

      const duration = options.getString(
        ThreadArchiveOption.duration ?? undefined
      ) as ThreadArchiveOptionChoices | undefined;

      const friendlyArchiveDuration = (
        duration: Discord.ThreadAutoArchiveDuration
      ) => {
        const map = {
          [Discord.ThreadAutoArchiveDuration.OneHour]: "1 Hour",
          [Discord.ThreadAutoArchiveDuration.OneDay]: "1 Day",
          [Discord.ThreadAutoArchiveDuration.ThreeDays]: "3 Days",
          [Discord.ThreadAutoArchiveDuration.OneWeek]: "1 Week",
        };

        return map[duration];
      };

      if (isThread) {
        if (duration === ThreadArchiveOptionChoices.now) {
          await interaction.reply({
            content: "Done",
          });
          currentThread.setArchived();
        } else {
          const d = Number(
            duration || Discord.ThreadAutoArchiveDuration.OneHour
          ) as Discord.ThreadAutoArchiveDuration;

          currentThread.setAutoArchiveDuration(d);
          await interaction.reply({
            content: `Done. This thread will be archived in ${friendlyArchiveDuration(
              d
            )}`,
          });
        }
      }
      return {
        name: "archive",
        response: {
          threadId: currentThread?.id,
        },
      };
    },
    publish: async () => {
      const { options, user } = interaction;

      const guildLabsRole = discord.role("labs");
      const userHasDevRole = discord.hasRole(user.id, "dev");

      if (!userHasDevRole) {
        await interaction.reply({
          content: `Sorry, only CF dev's can publish.`,
          ephemeral: true,
        });
        return undefined;
      }

      const version =
        options.getString(IssueCommandOptions.version) ?? undefined;

      const packageVersionSummary = discord.embed({
        title: version ?? "latest",
        url: getArtifactUrl(version),
        author: {
          name: user.username,
          iconURL: user.avatarURL() ?? user.avatar ?? "",
        },
        footer: {
          iconURL: guild.iconURL() ?? guild.icon ?? "",
          text: npmInstallHint(version),
        },
      });

      discord.channel("releases")?.send({
        content: `Hey ${roleMention(
          guildLabsRole?.id ?? ""
        )}, the team has released a new version.`,
        embeds: [packageVersionSummary],
      });

      await interaction.reply({
        content: "Done.",
        ephemeral: true,
      });

      return {
        name: "publish",
        response: undefined,
      };
    },
    assign: async () => {
      const { channelId, user, options } = interaction;

      const currentChannel = discord.threadById(channelId);

      const userHasDevRole = discord.hasRole(user.id, "dev");

      const validAssignee = derive(() => {
        const assigneeOption =
          options.getUser(AssignOption.assignee) || undefined;

        if (assigneeOption) {
          const assigneeUser = discord.member(assigneeOption.id);

          const assigneeHasDevRole = discord.hasRole(assigneeUser?.id, "dev");
          if (assigneeHasDevRole) {
            return { assignee: assigneeOption, assigneeUser };
          }
        }
      });

      if (!currentChannel) {
        await interaction.reply({
          content: "/assign command must be executed inside threads",
          ephemeral: true,
        });

        return undefined;
      } else if (!userHasDevRole) {
        await interaction.reply({
          content: "/assign command should be executed by CF Devs only",
          ephemeral: true,
        });

        return undefined;
      }

      await interaction.reply({
        content: `Great! I'll assign this to ${
          validAssignee?.assignee
            ? validAssignee?.assigneeUser?.displayName
            : "you"
        }.`,
      });

      return {
        name: "assign",
        response: {
          thread: currentChannel,
          user,
          assignee: validAssignee?.assignee,
        },
      };
    },
    notion_batch_update: async () => {
      const { user, options } = interaction;

      const guildAdminRole = discord.role("admin");
      const userHasAdminRole = discord.hasRole(user.id, "admin");

      const mention = guildAdminRole
        ? roleMention(guildAdminRole?.id)
        : "admin";

      await interaction.reply({
        content: userHasAdminRole
          ? "Processing..."
          : `Sorry, can't do that. Ask an ${mention}.`,
        ephemeral: true,
      });

      const start_date = options.getString(
        BatchOptions.start_date ?? undefined
      ) as BatchOptions | undefined;

      const end_date = options.getString(BatchOptions.end_date ?? undefined) as
        | BatchOptions
        | undefined;

      return {
        name: "notion_batch_update",
        response: {
          isAllowed: !!userHasAdminRole,
          start_date,
          end_date,
        },
      };
    },
    kudos: async () => {
      const { user, options } = interaction;

      const kudosRecipient = options.getUser(KudosOption.to, true);
      const kudosType = options.getString(KudosOption.type, true);
      const publicOption = options.getBoolean(KudosOption.public);

      if (user.id === kudosRecipient.id) {
        await interaction.reply({
          content: "I see what you're doing...",
          ephemeral: true,
        });

        return undefined;
      }

      await interaction.reply({
        content: `Thank you! ${env.NEXT_PROD_URL}/kudos`,
        ephemeral: true,
      });

      const kudosAnnouncementMessage = derive(() => {
        if (publicOption) {
          return `Hey ${userMention(kudosRecipient.id)}! ${userMention(
            user.id
          )} thinks you're ${kudosType}.`;
        }

        return `Hey ${userMention(
          kudosRecipient.id
        )}! Someone thinks you're ${kudosType}.`;
      });

      BotLog.publicLog(() => {
        return {
          embeds: [
            discord.embed({
              title: "Kudos",
              url: env.NEXT_PROD_URL,
              description: kudosAnnouncementMessage,

              footer: {
                text: "React to this message to let them know you appreciate this.",
              },
            }),
          ],
        };
      });

      return {
        name: "kudos",
        response: {
          from: user,
          to: kudosRecipient,
          type: kudosType,
        },
      };
    },
    list_kudos: async () => {
      const { channelId } = interaction;

      const currentChannel = discord.channelById(channelId);

      interaction.reply({
        content:
          "Here you go.. You can also check the status here: https://next-cf.up.railway.app/kudos",
        ephemeral: true,
      });

      return {
        name: "list_kudos",
        response: {
          channel: currentChannel,
        },
      };
    },
    sync_guild_users: async () => {
      const { user } = interaction;
      const guildAdminRole = discord.role("admin");
      const userHasAdminRole = discord.hasRole(user.id, "admin");

      if (!userHasAdminRole) {
        const mention = guildAdminRole
          ? roleMention(guildAdminRole?.id)
          : "admin";
        await interaction.reply({
          content: `Sorry, can't do that. Ask an ${mention}.`,
          ephemeral: true,
        });
        return undefined;
      }

      const rawMembersData = await guild.members.fetch();
      const guildUsers: GuildUser[] = rawMembersData.map(
        DataUtils.transformGuildMemberData
      );

      await interaction.reply({
        content: `Processing ${guildUsers.length} members.`,
        ephemeral: true,
      });

      return {
        name: "sync_guild_users",
        response: {
          guildUsers,
        },
      };
    },
    announce: async () => {
      const { user, options, channel } = interaction;

      const userHasAdminRole = discord.hasRole(user.id, "admin");

      if (userHasAdminRole) {
        const title = options.getString(Announce.title, true);
        const description =
          options.getString(Announce.announcement) || undefined;
        const extra = options.getString(Announce.extra) || undefined;
        const url = options.getString(Announce.url) || undefined;
        const attachment = options.getAttachment(Announce.attachment);
        const role = options.getRole(Announce.mention) as Discord.Role;

        const issueSummary = discord.embed({
          title,
          description,
          url,
          image: {
            url: attachment?.url || "",
          },
        });

        await interaction.reply({
          content: `Done.`,
          ephemeral: true,
        });

        await channel?.send({
          content: role ? `${roleMention(role.id)}` : undefined,
          embeds: [issueSummary],
        });

        if (extra) {
          await channel?.send({
            content: extra,
          });
        }

        return {
          name: "announce",
          response: undefined,
        };
      }

      await interaction.reply({
        content: "Can't do that..",
        ephemeral: true,
      });
    },
    schedules: async () => {
      const tasks = cron.getTasks().entries();

      const currentSchedules = [];

      for (const [key] of tasks) {
        currentSchedules.push(key);
      }

      await interaction.reply({
        content: currentSchedules.join("\n"),
        ephemeral: true,
      });

      return {
        name: "schedules",
        response: undefined,
      };
    },
  };

  return await commands[commandName]();
};

//endregion

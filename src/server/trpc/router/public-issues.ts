import type { GuildUser } from "@prisma/client";
import { type Issue } from "@prisma/client";
import {
  EmbedBuilder,
  roleMention,
  ThreadAutoArchiveDuration,
  userMention,
  type Role,
} from "discord.js";
import { truncate } from "lodash";
import { z } from "zod";
import { issueProcedureSchema } from "../../../components/IssueForm/validator";
import { env } from "../../../env/server";
import { IssueScope } from "../../../shared/enums";
import type {
  DiscordIssueDetailsModel,
  IssueModel,
  NotionIssueDetailsModel,
} from "../../../shared/models";
import notion from "../../../shared/notion";
import { handledProcedure } from "../../../utils/trpc";
import { prismaNext } from "../../db/client";
import { discordNext } from "../../discord/client";
import { publicProcedure, router } from "../trpc";

export const publicIssuesRouter = router({
  createIssue: publicProcedure
    .input(
      z.object({
        secret: z.string().optional(),
        issue: issueProcedureSchema,
      })
    )
    .mutation(async ({ ctx, input: { issue, secret } }) => {
      return handledProcedure(async () => {
        if (secret !== env.ISSUES_FORM_SECRET) {
          throw Error("Invalid Secret");
        }

        const mapping = await ctx.prisma.issueIdMapping.create({
          data: {
            author: issue.author?.name,
            title: issue.title,
          },
        });

        const prepareData: Omit<Issue, "id"> = {
          title: issue.title,
          description: issue.description,
          lab: issue.lab.name,
          labId: issue.lab.id,
          version: issue.version,
          type: issue.type,
          stepsToReproduce: issue.stepsToReproduce,
          component: issue.component,
          severity: issue.severity || null,
          specs: issue.specs,
          codeSnippet: issue.codeSnippet,
          checkTechLead: !!issue.checkTechLead,
          checkDesign: !!issue.checkDesign,
          scope: issue.scope,
          azureWorkItem: issue.azureWorkItem || "",
          attachment: issue.files[0]?.url,
          attachment2: issue.files[1]?.url,

          issueIdMappingId: mapping.id,

          author: issue.author?.name || null,

          createdAt: new Date(),
          timestamp: new Date(),
          status: "TODO",
          discordThreadId: null,
          platform: issue.platform || null,
          componentId: issue.componentId,
        };

        const issueResponse = await ctx.prisma.issue.create({
          data: prepareData,
        });

        return {
          issue: issueResponse,
          issueMapping: mapping,
        };
      }, "Phase 1: createIssue error");
    }),
  createNotionIssue: publicProcedure
    .input(
      z.object({
        secret: z.string().optional(),
        issue: z.custom<NotionIssueDetailsModel>(),
      })
    )
    .mutation(async ({ ctx, input: { issue, secret } }) => {
      return handledProcedure(async () => {
        if (secret !== env.ISSUES_FORM_SECRET) {
          throw Error("Invalid Secret");
        }

        const component = await ctx.prisma.component.findUnique({
          where: {
            id: issue.componentId || "",
          },
        });
        const pageId = await notion.addIssue({
          ...issue,
          componentId: component?.notion_id || null,
        });
        const pageUrl = pageId ? await notion?.getPageUrl(pageId) : undefined;

        return { pageId, pageUrl };
      }, "Phase 2: createNotionIssue error");
    }),
  openThread: publicProcedure
    .input(
      z.object({
        secret: z.string().optional(),
        userId: z.string(),
        data: z.custom<DiscordIssueDetailsModel>(),
      })
    )
    .mutation(
      async ({
        ctx,
        input: {
          data: { issue, notionPageUrl },
          userId,
          secret,
        },
      }) => {
        return handledProcedure(async () => {
          if (secret !== env.ISSUES_FORM_SECRET) {
            throw Error("Invalid Secret");
          }

          const user = await ctx.prisma.guildUser.findUnique({
            where: {
              id: userId,
            },
          });

          const thread = await createIssueThread({
            issue,
            notionPageUrl,
            user,
          });

          return {
            threadId: thread?.id,
            threadUrl: thread?.url,
          };
        }, "Phase 3: openThread error");
      }
    ),
  updateNotionPage: publicProcedure
    .input(
      z.object({
        secret: z.string().optional(),
        pageId: z.string().optional(),
        threadUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input: { pageId, threadUrl, secret } }) => {
      return handledProcedure(async () => {
        if (secret !== env.ISSUES_FORM_SECRET) {
          throw Error("Invalid Secret");
        }

        await notion.updatePageThread(pageId, threadUrl);
      }, "Phase 4: updateNotionPage error");
    }),
  updateIssueMapping: publicProcedure
    .input(
      z.object({
        secret: z.string().optional(),
        data: z.object({
          mappingId: z.number(),
          issueAuthor: z.string().nullable(),
          issueTitle: z.string().nullable(),
          notionPageId: z.string().optional(),
          notionPageUrl: z.string().optional(),
          threadId: z.string().optional(),
          threadUrl: z.string().optional(),
        }),
      })
    )
    .mutation(
      async ({
        ctx,
        input: {
          secret,
          data: {
            mappingId,
            notionPageId,
            notionPageUrl,
            threadId,
            threadUrl,
            issueAuthor,
            issueTitle,
          },
        },
      }) => {
        return handledProcedure(async () => {
          if (secret !== env.ISSUES_FORM_SECRET) {
            throw Error("Invalid Secret");
          }

          await ctx.prisma.issueIdMapping.update({
            where: {
              id: mappingId,
            },
            data: {
              notion_page_id: notionPageId,
              notion_page_url: notionPageUrl,
              discord_thread_id: threadId,
              discord_thread_url: threadUrl,
              author: issueAuthor,
              title: issueTitle,
            },
          });
        }, "Phase 5: updateIssueMapping error");
      }
    ),
});

const createIssueThread = async ({
  issue,
  user,
  notionPageUrl,
}: {
  issue: IssueModel;
  user?: GuildUser | null;
  notionPageUrl?: string;
}) => {
  try {
    const { type, component, title, scope } = issue;

    const fullTitle = `[${type}] ${component} - ${title}`;

    if (issue?.labId && user && notionPageUrl) {
      const lab = await prismaNext.labs.read(issue.labId);

      if (lab?.channelId && lab?.guildRoleId && notionPageUrl) {
        const channel = discordNext.channelById(lab?.channelId);
        const thread = await channel?.threads.create({
          name: truncate(fullTitle, {
            length: 99,
          }),
          autoArchiveDuration: ThreadAutoArchiveDuration.OneWeek,
          reason: `Issue: ${title}`,
        });

        const scopeMentions = mentionsByScope(scope, {
          dev: discordNext.role("dev"),
          design: discordNext.role("design"),
        });

        const labMention = roleMention(lab.guildRoleId);
        const projectManagerRole = discordNext.role("projectManager");
        const pmMention = projectManagerRole
          ? roleMention(projectManagerRole.id)
          : "";

        if (thread) {
          await thread?.send({
            content: `${pmMention} ${scopeMentions} ${labMention}`,
            embeds: [
              new EmbedBuilder()
                .setTitle(title)
                .setURL(notionPageUrl)
                .setFooter({
                  text: "Follow the issue status on Notion.",
                  iconURL: `${env.AWS_S3_PUBLIC_URL}/generic/f9db27e5-c347-45c3-a5b9-6ed05de374f7__notion_logo_resized.png`,
                })
                .addFields([
                  {
                    name: "Author",
                    value: userMention(user.id),
                    inline: true,
                  },
                ])
                .setTimestamp(),
            ],
          });

          return {
            id: thread.id,
            url: thread.url,
          };
        }
      }
    }
  } catch (error) {
    console.log("createIssueThread:error: ", error);
  }
};

const mentionsByScope = (
  scope: string | null,
  roles: { dev?: Role; design?: Role }
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

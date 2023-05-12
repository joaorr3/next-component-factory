import type { GuildUser } from "@prisma/client";
import { type Issue } from "@prisma/client";
import {
  EmbedBuilder,
  roleMention,
  ThreadAutoArchiveDuration,
  userMention,
  type Role,
} from "discord.js";
import { isNaN, truncate } from "lodash";
import { z } from "zod";
import { type FiltersModel } from "../../../components/Issue/Filters";
import { issueProcedureSchema } from "../../../components/IssueForm/validator";
import { IssueScope } from "../../../shared/enums";
import type {
  DiscordIssueDetailsModel,
  IssueModel,
  NotionIssueDetailsModel,
} from "../../../shared/models";
import notion from "../../../shared/notion";
import { derive } from "../../../shared/utils";
import { handledProcedure } from "../../../utils/trpc";
import { prismaNext } from "../../db/client";
import { discordNext } from "../../discord/client";

import { protectedProcedure, router } from "../trpc";

export const issuesRouter = router({
  all: protectedProcedure.query(async ({ ctx }) => {
    const all = await ctx.prisma.issue.findMany();

    return all.reverse();
  }),
  detail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input: { id } }) => {
      return await ctx.prisma.issue.findFirst({
        where: {
          id: Number(id),
        },
        include: {
          IssuesMedia: true,
          IssueMapping: true,
        },
      });
    }),
  search: protectedProcedure
    .input(z.custom<FiltersModel>())
    .query(async ({ ctx, input: { id, title, author, type, component } }) => {
      const validId = derive(() => {
        if (id) {
          const parsed = parseInt(id);
          return !isNaN(parsed) ? parsed : undefined;
        }

        return undefined;
      });

      if (!!validId || !!title || !!author || !!type || !!component) {
        return await ctx.prisma.issue.findMany({
          where: {
            id: validId,
            title: {
              contains: title,
            },
            author: {
              contains: author,
            },
            type: {
              contains: type,
            },
            component: {
              contains: component,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      }

      return await ctx.prisma.issue.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  createIssue: protectedProcedure
    .input(issueProcedureSchema)
    .mutation(async ({ ctx, input }) => {
      return handledProcedure(async () => {
        const user = await ctx.prisma.user.findUnique({
          where: {
            id: ctx.session.user.id,
          },
          include: {
            GuildUser: true,
          },
        });

        const mapping = await ctx.prisma.issueIdMapping.create({
          data: {
            author: user?.name,
            title: input.title,
          },
        });

        const prepareData: Omit<Issue, "id"> = {
          title: input.title,
          description: input.description,
          lab: input.lab,
          labId: input.labId,
          version: input.version,
          type: input.type,
          stepsToReproduce: input.stepsToReproduce,
          component: input.component,
          severity: input.severity || null,
          specs: input.specs,
          codeSnippet: input.codeSnippet,
          checkTechLead: !!input.checkTechLead,
          checkDesign: !!input.checkDesign,
          scope: input.scope,
          azureWorkItem: input.azureWorkItem || "",
          attachment: input.files[0]?.url,
          attachment2: input.files[1]?.url,

          issueIdMappingId: mapping.id,

          author: user?.name || null,

          createdAt: new Date(),
          timestamp: new Date(),
          status: "TODO",
          discordThreadId: null,
          platform: input.platform || null,
          componentId: input.componentId,
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
  createNotionIssue: protectedProcedure
    .input(z.custom<NotionIssueDetailsModel>())
    .mutation(async ({ ctx, input }) => {
      return handledProcedure(async () => {
        const component = await ctx.prisma.component.findUnique({
          where: {
            id: input.componentId || "",
          },
        });
        const pageId = await notion.addIssue({
          ...input,
          componentId: component?.notion_id || null,
        });
        const pageUrl = pageId ? await notion?.getPageUrl(pageId) : undefined;

        return { pageId, pageUrl };
      }, "Phase 2: createNotionIssue error");
    }),
  openThread: protectedProcedure
    .input(z.custom<DiscordIssueDetailsModel>())
    .mutation(async ({ ctx, input: { issue, notionPageUrl } }) => {
      return handledProcedure(async () => {
        const user = await ctx.prisma.user.findUnique({
          where: {
            id: ctx.session.user.id,
          },
          include: {
            GuildUser: true,
          },
        });

        const thread = await createIssueThread({
          issue,
          notionPageUrl,
          user: user?.GuildUser,
        });

        return {
          threadId: thread?.id,
          threadUrl: thread?.url,
        };
      }, "Phase 3: openThread error");
    }),
  updateNotionPage: protectedProcedure
    .input(
      z.object({
        pageId: z.string().optional(),
        threadUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input: { pageId, threadUrl } }) => {
      return handledProcedure(async () => {
        await notion.updatePageThread(pageId, threadUrl);
      }, "Phase 4: updateNotionPage error");
    }),

  updateIssueMapping: protectedProcedure
    .input(
      z.object({
        mappingId: z.number(),
        issueAuthor: z.string().nullable(),
        issueTitle: z.string().nullable(),
        notionPageId: z.string().optional(),
        notionPageUrl: z.string().optional(),
        threadId: z.string().optional(),
        threadUrl: z.string().optional(),
      })
    )
    .mutation(
      async ({
        ctx,
        input: {
          mappingId,
          notionPageId,
          notionPageUrl,
          threadId,
          threadUrl,
          issueAuthor,
          issueTitle,
        },
      }) => {
        return handledProcedure(async () => {
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
                  iconURL:
                    "https://component-factory-s3-bucket.s3.eu-west-2.amazonaws.com/generic/f9db27e5-c347-45c3-a5b9-6ed05de374f7__notion_logo_resized.png",
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

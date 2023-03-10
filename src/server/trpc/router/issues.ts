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
import { env } from "../../../env/server";
import { IssueScope } from "../../../shared/enums";
import notion from "../../../shared/notion";
import { derive } from "../../../shared/utils";
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
  open: protectedProcedure
    .input(issueProcedureSchema)
    .mutation(async ({ ctx, input }) => {
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
        severity: input.severity,
        specs: input.specs,
        codeSnippet: input.codeSnippet,
        checkTechLead: input.checkTechLead,
        checkDesign: input.checkDesign,
        scope: input.scope,
        azureWorkItem: input.azureWorkItem,
        attachment: input.files[0]?.url,
        attachment2: input.files[1]?.url,

        issueIdMappingId: mapping.id,

        author: user?.name || null,

        createdAt: new Date(),
        timestamp: new Date(),
        status: "TODO",
        discordThreadId: null,
        platform: input.platform,
      };

      const issueResponse = await ctx.prisma.issue.create({
        data: prepareData,
      });

      const thread = await createIssueThread(issueResponse, user?.GuildUser);
      const page_id = await notion?.addIssue(issueResponse);

      if (thread && page_id) {
        const pageUrl = await notion?.getPageUrl(page_id);

        await ctx.prisma.issueIdMapping.update({
          where: {
            id: mapping.id,
          },
          data: {
            notion_page_id: page_id,
            notion_page_url: pageUrl,
            discord_thread_id: thread.id,
            discord_thread_url: thread.url,
            author: issueResponse.author,
            title: issueResponse.title,
          },
        });
      }
      return issueResponse;
    }),
});

const createIssueThread = async (issue: Issue, user?: GuildUser | null) => {
  try {
    const { type, component, title, scope } = issue;

    const fullTitle = `[${type}] ${component} - ${title}`;

    if (issue?.labId && user) {
      const lab = await prismaNext.labs.read(issue.labId);
      if (lab?.channelId && lab?.guildRoleId) {
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

        if (thread) {
          await thread?.send({
            content: `${scopeMentions} ${labMention}`,
            embeds: [
              new EmbedBuilder()
                .setTitle(title)
                .setURL(`${env.NEXT_PROD_URL}/issue/${issue.id}`)
                .setAuthor({
                  name: user.friendlyName || user.username,
                  iconURL: user.avatarURL || undefined,
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

          await thread.send({
            content: `${env.NEXT_PROD_URL}/issue/${issue.id}`,
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

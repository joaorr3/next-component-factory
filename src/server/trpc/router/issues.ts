import { type Issue } from "@prisma/client";
import { z } from "zod";
import { type FiltersModel } from "../../../components/Issue/Filters";
import { issueProcedureSchema } from "../../../components/IssueForm/validator";

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
      });
    }),
  search: protectedProcedure
    .input(z.custom<FiltersModel>())
    .query(async ({ ctx, input: { id, title, author, type } }) => {
      return await ctx.prisma.issue.findMany({
        where: {
          id: id ? Number(id) : undefined,
          title: {
            contains: title,
          },
          author: {
            contains: author,
          },
          type: {
            contains: type,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  open: protectedProcedure
    .input(issueProcedureSchema)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;

      const mapping = await ctx.prisma.issueIdMapping.create({
        data: {
          notion_page_id: null,
          discord_thread_id: null,
          author: user.name,
          title: input.title,
        },
      });

      const prepareData: Omit<Issue, "id"> = {
        title: input.title,
        description: input.description,
        lab: input.lab,
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

        author: user.name || null,

        createdAt: new Date(),
        timestamp: new Date(),
        status: "TODO",
        discordThreadId: null,
      };

      const issueResponse = await ctx.prisma.issue.create({
        data: prepareData,
      });

      return issueResponse;
    }),
});

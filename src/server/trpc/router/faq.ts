import slugify from "slugify";
import { z } from "zod";
import { slug } from "../../../shared/utils";
import { notEmptyString } from "../../../utils/validators";
import { prismaNext } from "../../db/client";
import { protectedProcedure, publicProcedure, router } from "../trpc";

const faqSchema = z.object({
  label: notEmptyString,
  type: z.string().nullable(),
  markdown: notEmptyString,
  createdBy: z.string().nullable(),
  publish: z.boolean(),
  sortingPriority: z.number().nullable(),
  timestamp: z.date(),
});

export const faqRouter = router({
  create: protectedProcedure
    .input(z.object({ faq: faqSchema }))
    .mutation(async ({ input }) => {
      const data = {
        ...input.faq,
        slug: slug(input.faq.label),
      };

      return await prismaNext.faq.create(data);
    }),
  read: publicProcedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ input }) => {
      if (input.id) {
        return await prismaNext.faq.read(Number(input.id));
      }
    }),
  readMany: publicProcedure.query(async () => {
    return await prismaNext.faq.readMany();
  }),
  readManyPublic: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.fAQ.findMany({
      where: {
        publish: {
          equals: true,
        },
      },
      orderBy: {
        sortingPriority: "desc",
      },
    });
  }),
  readBySlug: publicProcedure
    .input(z.object({ slug: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (input.slug) {
        return await ctx.prisma.fAQ.findUnique({
          where: {
            slug: input.slug,
          },
        });
      }
    }),
  update: protectedProcedure
    .input(z.object({ faq: faqSchema, id: z.string() }))
    .mutation(async ({ input }) => {
      if (input.id) {
        const data = {
          ...input.faq,
          slug: slugify(input.faq.label, {
            replacement: "_",
            lower: true,
          }),
        };

        return await prismaNext.faq.update(data, Number(input.id));
      }
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      if (input.id) {
        return await prismaNext.faq.delete(Number(input.id));
      }
    }),
});

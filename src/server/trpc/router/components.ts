import { z } from "zod";
import { notEmptyString } from "../../../utils/validators";
import notion from "../../../shared/notion";
import { router, protectedProcedure } from "../trpc";
import { wait } from "../../../shared/utils";

export const componentFormSchema = z.object({
  id: z.string().optional(),
  name: notEmptyString,
  category: z.enum(["ATOMS", "BASE", "MOLECULES", "ORGANISMS"]),
  description: z.string().nullable(),
});

export type ComponentFormModel = z.infer<typeof componentFormSchema>;

export const componentsRouter = router({
  all: protectedProcedure.query(async ({ ctx }) => {
    const components = await ctx.prisma.component.findMany();
    return components;
  }),
  allNotion: protectedProcedure.query(async () => {
    const notion_comps = notion.getComponentDatabase();
    return notion_comps;
  }),
  syncNotion: protectedProcedure
    .input(z.custom<Array<{ id: string; name: string }>>())
    .mutation(async ({ ctx, input }) => {
      for (const { id, name } of input) {
        const comp = await ctx.prisma.component.findFirst({
          where: {
            name,
          },
        });

        if (comp?.id) {
          await ctx.prisma.component.update({
            where: {
              id: comp.id,
            },
            data: {
              notion_id: id,
            },
          });
          console.log(`Comp: ${comp.name}, updated with notionId: ${id}`);
        }
        await wait(200);
      }
    }),
  detail: protectedProcedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ ctx, input: { id } }) => {
      if (!id) {
        return undefined;
      }
      const component = await ctx.prisma.component.findUnique({
        where: {
          id,
        },
      });

      return component;
    }),
  create: protectedProcedure
    .input(
      z.object({
        componentData: componentFormSchema,
      })
    )
    .mutation(async ({ ctx, input: { componentData } }) => {
      const component = await ctx.prisma.component.create({
        data: componentData,
      });

      return component;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        componentData: componentFormSchema,
      })
    )
    .mutation(async ({ ctx, input: { id, componentData } }) => {
      const component = await ctx.prisma.component.update({
        where: {
          id,
        },
        data: componentData,
      });

      return component;
    }),
  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { id } }) => {
      const component = await ctx.prisma.component.delete({
        where: {
          id,
        },
      });

      return component;
    }),
});

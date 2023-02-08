import type { FAQ } from "@prisma/client";
import { z } from "zod";
import type { PickPartial } from "../../../shared/utilityTypes";
import { prismaNext } from "../../db/client";
import { protectedProcedure, publicProcedure, router } from "../trpc";

const faqSchema = z.custom<PickPartial<FAQ, "id">>();

export const faqRouter = router({
  create: protectedProcedure
    .input(z.object({ faq: faqSchema }))
    .mutation(async ({ input }) => {
      return await prismaNext.faq.create(input.faq);
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
  update: protectedProcedure
    .input(z.object({ faq: faqSchema, id: z.string() }))
    .mutation(async ({ input }) => {
      if (input.id) {
        return await prismaNext.faq.update(input.faq, Number(input.id));
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

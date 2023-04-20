import { z } from "zod";
import notion from "../../../shared/notion";
import {
  notionPullRequestCommentedValidator,
  notionPullRequestCreatedValidator,
  notionPullRequestUpdatedValidator,
} from "../../../utils/validators/notion";

import { protectedProcedure, router } from "../trpc";

export const notionRouter = router({
  getPrPageByPrId: protectedProcedure
    .input(
      z.object({
        prId: z.string(),
      })
    )
    .query(async ({ input }) => {
      return await notion.getPrPageByPrId(input.prId);
    }),
  getPrDatabase: protectedProcedure.query(async () => {
    return await notion.getPrDatabase();
  }),
  getPrDatabaseItems: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input: { cursor } }) => {
      return await notion.getPrDatabaseItems(cursor);
    }),
  createPr: protectedProcedure
    .input(notionPullRequestCreatedValidator)
    .mutation(async ({ input }) => {
      return await notion.createPr(input);
    }),
  updatePr: protectedProcedure
    .input(notionPullRequestUpdatedValidator)
    .mutation(async ({ input }) => {
      return await notion.updatePr(input);
    }),
  commentedPr: protectedProcedure
    .input(notionPullRequestCommentedValidator)
    .mutation(async ({ input }) => {
      return await notion.commentedPr(input);
    }),
});

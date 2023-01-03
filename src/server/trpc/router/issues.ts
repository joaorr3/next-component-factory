import { z } from "zod";

import { router, protectedProcedure } from "../trpc";

export const issuesRouter = router({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.issue.findMany();
  }),
  detail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input: { id } }) => {
      return ctx.prisma.issue.findFirst({
        where: {
          id: Number(id),
        },
      });
    }),
});

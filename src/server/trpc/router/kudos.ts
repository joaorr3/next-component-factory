// import { z } from "zod";

import { parseKudos } from "../../../shared/dataUtils";
import { publicProcedure, router } from "../trpc";

export const kudosRouter = router({
  all: publicProcedure.query(async ({ ctx }) => {
    const allKudos = await ctx.prisma.kudos.findMany({
      include: {
        to: true,
      },
    });
    return parseKudos(allKudos);
  }),
  // detail: protectedProcedure
  //   .input(z.object({ id: z.string() }))
  //   .query(({ ctx, input: { id } }) => {
  //     return ctx.prisma.kudos.findFirst({
  //       where: {
  //         id: Number(id),
  //       },
  //     });
  //   }),
});

import { z } from "zod";

import { router, protectedProcedure } from "../trpc";

export const userRouter = router({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),
  detail: protectedProcedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ ctx, input: { id } }) => {
      if (!id) {
        return undefined;
      }
      const user = await ctx.prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          GuildUser: true,
        },
      });

      return user?.GuildUser;
    }),
  current: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.prisma.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
      include: {
        GuildUser: true,
      },
    });

    return user?.GuildUser;
  }),
});

import { z } from "zod";
import { getUserRoles } from "../../../shared/roles";
import { protectedProcedure, router } from "../trpc";

export const rolesRouter = router({
  all: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.guildRole.findMany({
      include: {
        lab: true,
      },
    });
  }),
  autoAssignable: protectedProcedure.query(async ({ ctx }) => {
    const userRoles = await ctx.prisma.guildRole.findMany({
      where: {
        isAutoAssignable: true,
      },
    });
    return userRoles;
  }),
  currentUser: protectedProcedure.query(
    async ({ ctx: { session, prisma } }) => {
      const userRoles = await getUserRoles(session, prisma);
      return userRoles;
    }
  ),
  updateRole: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        isAutoAssignable: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.guildRole.update({
        where: {
          id: input.id,
        },
        data: {
          isAutoAssignable: input.isAutoAssignable,
        },
      });
    }),
});

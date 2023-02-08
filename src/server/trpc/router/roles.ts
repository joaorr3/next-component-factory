import { getUserRoles } from "../../../shared/roles";
import { protectedProcedure, router } from "../trpc";

export const rolesRouter = router({
  autoAssignable: protectedProcedure.query(async ({ ctx }) => {
    const userRoles = await ctx.prisma.guildRole.findMany({
      where: {
        isAutoAssignable: {
          equals: true,
        },
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
});

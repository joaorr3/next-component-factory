import { getUserRoles } from "../../../shared/roles";
import { protectedProcedure, router } from "../trpc";

export const rolesRouter = router({
  currentUser: protectedProcedure.query(
    async ({ ctx: { session, prisma } }) => {
      const userRoles = await getUserRoles(session, prisma);
      return userRoles;
    }
  ),
});

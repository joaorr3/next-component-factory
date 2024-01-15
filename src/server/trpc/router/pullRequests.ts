import { isNaN } from "lodash";
import { z } from "zod";
import { type FiltersModel } from "../../../components/PullRequest/Filters";
import { derive } from "../../../shared/utils";

import { protectedProcedure, router } from "../trpc";

export const pullRequestsRouter = router({
  searchOnDashboard: protectedProcedure
    .input(z.custom<FiltersModel>())
    .query(async ({ ctx, input: { id, title, author, status } }) => {
      const validId = derive(() => {
        if (id) {
          const parsed = parseInt(id);
          return !isNaN(parsed) ? parsed : undefined;
        }

        return undefined;
      });

      const filter = {
        id: validId,
        title: {
          contains: title,
        },
        guildUserId: author, //JOAO - preciso mostrar o nome do autor mas selecionar o ID la no form
        status: status,
      };

      const grouped = await ctx.prisma.pullRequest.groupBy({
        by: ["status"],
        where: filter,
        _count: {
          id: true,
        },
      });

      const counts = grouped.map((group) => {
        return {
          status: group.status,
          count: group._count.id,
        };
      });

      const list = await ctx.prisma.pullRequest.findMany({
        where: filter,
        include: {
          guildUser: true,
          lastActionGuildUser: true,
        },
      });

      return { counts, list };
    }),
});

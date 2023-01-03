import { z } from "zod";

import { router, publicProcedure } from "../trpc";

export const exampleRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return new Promise<{ greeting: string }>((res) => {
        setTimeout(() => {
          res({
            greeting: `Hello ${input?.text ?? "world"}`,
          });
        }, 1000);
      });
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.issue.findMany();
  }),
});

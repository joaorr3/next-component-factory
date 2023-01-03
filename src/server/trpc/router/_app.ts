import { router } from "../trpc";
import { authRouter } from "./auth";
import { discordRouter } from "./discord";
import { exampleRouter } from "./example";
import { issuesRouter } from "./issues";
import { kudosRouter } from "./kudos";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  issues: issuesRouter,
  kudos: kudosRouter,
  discord: discordRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

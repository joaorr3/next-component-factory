import { router } from "../trpc";
import { authRouter } from "./auth";
import { componentsRouter } from "./components";
import { discordRouter } from "./discord";
import { exampleRouter } from "./example";
import { imagesRouter } from "./images";
import { issuesRouter } from "./issues";
import { kudosRouter } from "./kudos";
import { rolesRouter } from "./roles";
import { userRouter } from "./user";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  issues: issuesRouter,
  kudos: kudosRouter,
  discord: discordRouter,
  user: userRouter,
  roles: rolesRouter,
  images: imagesRouter,
  components: componentsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

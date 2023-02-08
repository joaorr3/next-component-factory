import { router } from "../trpc";
import { authRouter } from "./auth";
import { componentsRouter } from "./components";
import { discordRouter } from "./discord";
import { exampleRouter } from "./example";
import { faqRouter } from "./faq";
import { issuesRouter } from "./issues";
import { kudosRouter } from "./kudos";
import { labsRouter } from "./labs";
import { mediaRouter } from "./media";
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
  media: mediaRouter,
  components: componentsRouter,
  labs: labsRouter,
  faq: faqRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

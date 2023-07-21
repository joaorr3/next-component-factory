import { router } from "../trpc";
import { authRouter } from "./auth";
import { azureRouter } from "./azure";
import { componentsRouter } from "./components";
import { discordRouter } from "./discord";
import { exampleRouter } from "./example";
import { faqRouter } from "./faq";
import { issuesRouter } from "./issues";
import { kudosRouter } from "./kudos";
import { labsRouter } from "./labs";
import { mediaRouter } from "./media";
import { notionRouter } from "./notion";
import { publicIssuesRouter } from "./public-issues";
import { rolesRouter } from "./roles";
import { userRouter } from "./user";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  issues: issuesRouter,
  publicIssues: publicIssuesRouter,
  kudos: kudosRouter,
  discord: discordRouter,
  user: userRouter,
  roles: rolesRouter,
  media: mediaRouter,
  components: componentsRouter,
  labs: labsRouter,
  faq: faqRouter,
  notion: notionRouter,
  azure: azureRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

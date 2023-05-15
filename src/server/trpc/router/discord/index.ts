import {
  buildValidator,
  workItemValidator,
} from "../../../../utils/validators/discord";
import { publicProcedure, router } from "../../trpc";
import { prRouter } from "./pr";

export const discordRouter = router({
  build: publicProcedure.input(buildValidator).query(async () => {
    return "not implemented";
  }),
  pr: prRouter,
  workItem: publicProcedure.input(workItemValidator).query(async () => {
    return "not implemented";
  }),
});

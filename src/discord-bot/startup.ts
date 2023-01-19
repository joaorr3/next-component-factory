import dotenv from "dotenv";
import { env } from "../env/server";
import { startBot } from "./bot";
import { startPrisma } from "./data";
import { startNotion } from "./notion";

dotenv.config({
  path: `.env.${process.env.NODE_ENV || "local"}`,
});

export const startApp = () => {
  const notionActions = startNotion({ start: env.START_NOTION === "true" });
  const prismaActions = startPrisma({ start: env.START_PRISMA === "true" });

  if (env.START_DISCORD === "true") {
    startBot({ notionActions, prismaActions });
  }
};

startApp();

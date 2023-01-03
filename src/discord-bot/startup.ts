import dotenv from "dotenv";
import { startBot } from "./bot";
import { startPrisma } from "./data";
import { startNotion } from "./notion";
import { config } from "./utils";

dotenv.config({
  path: `.env.${process.env.NODE_ENV || "local"}`,
});

export const startApp = () => {
  const {
    capabilities: { discord, notion, prisma },
  } = config();

  const notionActions = startNotion({ start: notion });
  const prismaActions = startPrisma({ start: prisma });

  if (discord) {
    startBot({ notionActions, prismaActions });
  }
};

startApp();

import dotenv from "dotenv";
import { env } from "../env/server";
import { initializeBot } from "./bot";

dotenv.config({
  path: `.env.${process.env.NODE_ENV || "local"}`,
});

export const startApp = () => {
  if (env.START_DISCORD === "true") {
    initializeBot();
  }
};

startApp();

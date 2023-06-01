import type { GuildUser } from "@prisma/client";
import dotenv from "dotenv";
import cron from "node-cron";
import { env } from "../env/server";
import { prismaSharedClient } from "../shared/prisma/client";
import { wait } from "../shared/utils";
import discord, { initializeBot } from "./bot";

dotenv.config({
  path: `.env.${process.env.NODE_ENV || "local"}`,
});

export const startApp = () => {
  if (env.START_DISCORD === "true") {
    initializeBot();
  }
};

const updateGuildUsers = async (guildUsers: GuildUser[]) => {
  let index = 0;

  return new Promise<number>(async (res) => {
    for (const guildUser of guildUsers) {
      await prismaSharedClient?.guildUser.upsertGuildUser(guildUser);
      await wait(500);
      index++;
      if (index === guildUsers.length) {
        res(index);
      }
    }
  });
};

const syncGuildUsers = async () => {
  const guildUsers = await discord.fetchMembers();
  const usersLength = await updateGuildUsers(guildUsers);
  await discord.sendMessage("botLogs", {
    content: `Synced ${usersLength} members.`,
  });
};

// once a week at midnight on sundays
// const cronExpression = "0 0 * * 0";

// everyday at 4am
const cronExpression2 = "0 4 * * *";

const task = cron.schedule(
  cronExpression2,
  () => {
    syncGuildUsers();
  },
  {
    timezone: "Europe/Lisbon",
    name: "Sync Guild Users",
  }
);

task.start();

startApp();

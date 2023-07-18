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

const notifyDevTeam = async () => {
  await discord.sendMessage("DEV-SYNC", {
    content: `Hey ${discord.mention({ roles: "dev" })}! Lets sync.`,
  });
};

// Every week day at 17:30
const devSyncExp = "30 17 * * 1-5";
const devSyncTask = cron.schedule(
  devSyncExp,
  () => {
    notifyDevTeam();
  },
  {
    timezone: "Europe/Lisbon",
    name: "Announce Dev Sync",
  }
);

// everyday at 4am
const syncGuildUsersExp = "0 4 * * *";
const syncGuildUsersTask = cron.schedule(
  syncGuildUsersExp,
  () => {
    syncGuildUsers();
  },
  {
    timezone: "Europe/Lisbon",
    name: "Sync Guild Users",
  }
);

syncGuildUsersTask.start();
devSyncTask.start();

startApp();

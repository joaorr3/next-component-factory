import type { GuildUser } from "@prisma/client";
import { CronTime } from "cron-time-generator";
import dotenv from "dotenv";
import { env } from "../env/server";
import { Cron } from "../shared/Cron";
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

  Cron(CronTime.everyDayAt(4), syncGuildUsers, "syncGuildUsers");
  Cron(CronTime.everyWeekDayAt(17, 30), notifyDevTeam, "notifyDevTeam");
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

startApp();

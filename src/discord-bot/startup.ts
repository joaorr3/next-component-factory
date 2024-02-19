import type { GuildUser } from "@prisma/client";
import { CronTime } from "cron-time-generator";
import { env } from "../env/server";
import { Cron } from "../shared/Cron";
import { prismaSharedClient } from "../shared/prisma/client";
import { wait } from "../shared/utils";
import discord, { initializeBot } from "./bot";
import express from "express";

const startApp = () => {
  const app = express();

  app.get("/", (_, res) => {
    res.send("CF Discord Bot");
  });

  app.get("/health-check", (req, res) => {
    res.status(200).json({ endPoint: req.url });
  });

  app.listen(+env.PORT, "0.0.0.0", () => {
    console.log(`Example app listening on port ${env.PORT}`);

    if (env.START_DISCORD === "true") {
      initializeBot();

      Cron(CronTime.everyWeek(), syncGuildUsers, "syncGuildUsers");
      Cron(CronTime.everyWeekDayAt(10, 15), notifyDevTeam, "notifyDevTeam");
    }
  });
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
    content: `Hey ${discord.mention({ roles: "dev" })}! Let's sync.`,
  });
};

startApp();

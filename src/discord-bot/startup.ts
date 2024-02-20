import type { GuildUser } from "@prisma/client";
import { CronTime } from "cron-time-generator";
import dayjs from "dayjs";
import express from "express";
import { difference, intersection } from "lodash";
import { env } from "../env/server";
import { azureSharedClient } from "../shared/azure";
import { Cron } from "../shared/Cron";
import notion from "../shared/notion";
import { prismaSharedClient } from "../shared/prisma/client";
import { DataExchange, getPullRequestUrl, wait } from "../shared/utils";
import discord, { initializeBot } from "./bot";

type PRExchangeModel = {
  title: string;
  author?: string;
  creationDate?: string;
  url?: string;
};

const dataExchange = new DataExchange<PRExchangeModel[]>({
  // 5 min
  pollTime: 1000 * 60 * 5,
  shouldFetch: () => {
    const pollRange = {
      from: 9,
      to: 20,
    };

    const time = +dayjs().format("HH");
    const should = time >= pollRange.from && time <= pollRange.to;
    return should;
  },
  fetchSource: async () => {
    const sourceData = await azureSharedClient.getPullRequests();
    const data = sourceData.map(
      (pr): PRExchangeModel => ({
        title: pr.title!,
        author: pr.createdBy!.displayName!,
        creationDate: dayjs(pr.creationDate as unknown as string).toISOString(),
        url: getPullRequestUrl(String(pr.pullRequestId)),
      })
    );
    return data;
  },
  fetchReplica: async () => {
    const replicaData = await notion.getAllPrs();
    const data = replicaData.map(
      ({ title, author, creationDate }): PRExchangeModel => ({
        title,
        author,
        creationDate: dayjs(creationDate).toISOString(),
      })
    );
    return data;
  },
  isEqual: ({ source, replica }) => {
    if (!source || !replica) {
      return false;
    }

    const sourceMap = source.map(({ title }) => title);
    const replicaMap = replica.map(({ title }) => title);
    const matches = intersection(sourceMap, replicaMap);

    const diff = difference(sourceMap, matches);

    return !diff.length;
  },
  insert: async ({ source, replica }) => {
    if (source && replica) {
      const sourceMap = source.map(({ title }) => title);
      const replicaMap = replica.map(({ title }) => title);

      const dataToInsert = difference(sourceMap, replicaMap);
      // const dataToUpdate = intersection(source, replica);

      for (const prTitle of dataToInsert) {
        const pr = source.find(({ title }) => title === prTitle);
        if (pr) {
          await notion.insertPr(pr);
        }
      }
    }
  },
});

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

      dataExchange.start();
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

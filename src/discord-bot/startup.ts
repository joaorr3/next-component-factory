import type { GuildUser } from "@prisma/client";
import { CronTime } from "cron-time-generator";
import dayjs from "dayjs";
import express from "express";
import { difference, intersection } from "lodash";
import { z } from "zod";
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
  // 2 min
  pollTime: 1000 * 60 * 2,
  shouldFetch: () => {
    const pollRange = {
      from: 8,
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
        author: pr.createdBy?.displayName!,
        creationDate: dayjs(pr.creationDate as unknown as string).toISOString(),
        url: getPullRequestUrl(String(pr.pullRequestId)),
      })
    );
    return data;
  },
  fetchReplica: async () => {
    const replicaData = await notion.getAllPrs();
    const data = replicaData
      .filter(({ creationDate }) => !!creationDate)
      .map(
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

const dataExchangeEndpointQueryScheme = z.object({
  action: z.enum(["start", "stop"]).optional(),
  pollTime: z
    .string()
    .transform((arg) => +arg)
    .optional(),
});

const startApp = () => {
  const app = express();

  app.get("/", (_, res) => {
    res.send("CF Discord Bot");
  });

  app.get("/health-check", (req, res) => {
    res.status(200).json({ endPoint: req.url });
  });

  app.get("/start-data-exchange", (req, res) => {
    const query = dataExchangeEndpointQueryScheme.safeParse(req.query);

    if (query.success) {
      if (query.data.action) {
        dataExchange[query.data.action]();
      }

      if (query.data.pollTime) {
        dataExchange.setPollTime(query.data.pollTime);
      }
    }

    res.status(200).json({
      endPoint: req.url,
      dataExchange: dataExchange.getStatus(),
    });
  });

  app.listen(+env.PORT, "0.0.0.0", () => {
    console.log(`Example app listening on port ${env.PORT}`);

    if (env.START_DISCORD === "true") {
      initializeBot();

      Cron(
        CronTime.everyWeekDayAt(8),
        () => dataExchange.start(),
        "start-data-exchange",
        dataExchange.getStatus().shouldFetch
      );

      Cron(
        CronTime.everyWeekDayAt(20),
        () => dataExchange.stop(),
        "stop-data-exchange"
      );

      Cron(CronTime.everyWeek(), syncGuildUsers, "syncGuildUsers");
      Cron(CronTime.everyWeekDayAt(12), notifyDevTeam, "notifyDevTeam");
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

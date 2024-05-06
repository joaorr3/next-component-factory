import type { GuildUser } from "@prisma/client";
import CronTime from "cron-time-generator";
import express from "express";
import cron from "node-cron";
import { z } from "zod";
import { Cron } from "../../shared/Cron";
import { prismaSharedClient } from "../../shared/prisma/client";
import { wait } from "../../shared/utils";
import discord from "../bot";
import { dataExchange } from "./dataExchange";

export const cronJobBodySchema = z.object({
  action: z.enum(["start", "stop"]).optional(),
  interval: z.string().optional(),
  runOnInit: z.boolean().optional(),
});

export type CronJob = {
  id: string;
  interval: string;
  event: () => void;
  runOnInit?: boolean;
};

export type CronJobBodySchema = z.infer<typeof cronJobBodySchema>;

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

const jobs: CronJob[] = [
  {
    interval: CronTime.everyWeekDayAt(8),
    id: "start-data-exchange",
    runOnInit: dataExchange.getStatus().shouldFetch,
    event: () => dataExchange.start(),
  },
  {
    interval: CronTime.everyWeekDayAt(20),
    id: "stop-data-exchange",
    event: () => dataExchange.stop(),
  },
  {
    interval: CronTime.everyWeek(),
    id: "syncGuildUsers",
    event: syncGuildUsers,
  },
  {
    interval: CronTime.everyWeekDayAt(12),
    id: "notifyDevTeam",
    event: notifyDevTeam,
  },
];

export const initCronJobs = () => {
  for (const job of jobs) {
    Cron(job.interval, job.event, job.id, job.runOnInit);
  }
};

export const cronJobsRouter = express.Router();

cronJobsRouter.get("/list", (_, res) => {
  res.status(200).json(
    jobs.map(({ id, interval, runOnInit }) => ({
      id,
      interval,
      runOnInit,
    }))
  );
});

cronJobsRouter.get("/list/:id", (req, res) => {
  const jobId = req.params.id;
  const task = cron.getTasks().get(jobId);

  res.status(200).json({
    // @ts-ignore
    timeMatcher: task?._scheduler.timeMatcher,
    // @ts-ignore
    eventsCount: task?._scheduler._eventsCount,
    // @ts-ignore
    options: task?.options,
  });
});

cronJobsRouter.post("/update/:id", (req, res) => {
  const jobId = req.params.id;
  let task = cron.getTasks().get(jobId);
  const job = jobs.find(({ id }) => id === jobId);

  const payload = cronJobBodySchema.safeParse(req.body);
  if (payload.success && task) {
    const { action, interval, runOnInit } = payload.data;

    if (action) {
      task[action]();
    }

    if (interval && job) {
      if (cron.validate(interval)) {
        task = Cron(interval, job.event, jobId, runOnInit);
      }
    }

    res.status(200).json({
      // @ts-ignore
      timeMatcher: task?._scheduler.timeMatcher,
      // @ts-ignore
      eventsCount: task?._eventsCount,
      // @ts-ignore
      options: task?.options,
    });
  } else {
    res.status(400).json("Bad request");
  }
});

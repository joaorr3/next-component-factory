import dayjs from "dayjs";
import express from "express";
import { difference, intersection } from "lodash";
import { z } from "zod";
import { azureSharedClient } from "../../shared/azure";
import notion from "../../shared/notion";
import { DataExchange, getPullRequestUrl } from "../../shared/utils";

type PRExchangeModel = {
  title: string;
  author?: string;
  creationDate?: string;
  url?: string;
};

export const dataExchangeBodySchema = z.object({
  action: z.enum(["start", "stop"]).optional(),
  pollTime: z.string().optional(),
});

export type DataExchangeBodySchema = z.infer<typeof dataExchangeBodySchema>;

export const dataExchange = new DataExchange<PRExchangeModel[]>({
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

export const dataExchangeRouter = express.Router();

dataExchangeRouter.get("/status", (_, res) => {
  res.status(200).json({
    status: dataExchange.getStatus(),
  });
});

dataExchangeRouter.post("/set", (req, res) => {
  const payload = dataExchangeBodySchema.safeParse(req.body);
  if (payload.success) {
    const { action, pollTime } = payload.data;

    if (action) {
      dataExchange[action]();
    }

    if (pollTime) {
      dataExchange.setPollTime(+pollTime);
    }

    res.status(200).json({
      status: dataExchange.getStatus(),
    });
  } else {
    res.status(400).json(payload.error.toString());
  }
});

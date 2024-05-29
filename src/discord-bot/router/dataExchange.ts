import dayjs from "dayjs";
import express from "express";
import { find, isEqual } from "lodash";
import { z } from "zod";
import { azureSharedClient } from "../../shared/azure";
import type { PullRequestModel } from "../../shared/models";
import { type PRExchangeModel } from "../../shared/models";
import notion from "../../shared/notion";
import { prismaSharedClient } from "../../shared/prisma/client";
import type { LastExchangeStatus } from "../../shared/utils";
import { DataExchange } from "../../shared/utils";

export const dataExchangeBodySchema = z.object({
  action: z.enum(["start", "stop"]).optional(),
  pollTime: z.string().optional(),
});

export type DataExchangeBodySchema = z.infer<typeof dataExchangeBodySchema>;

const findReplicaItem = (
  replica: PRExchangeModel[],
  params: Pick<PRExchangeModel, "url" | "pullRequestId" | "commitId" | "title">
) => {
  return find(
    replica,
    (r) =>
      r.url === params.url ||
      r.pullRequestId === params.pullRequestId ||
      r.commitId === params.commitId ||
      r.title === params.title
  );
};

type EqualShape = Pick<PRExchangeModel, "title" | "mergeStatus" | "status">;

const shouldUpdate = (source: PRExchangeModel, replica: PRExchangeModel) => {
  const a: EqualShape = {
    title: source.title,
    mergeStatus: source.mergeStatus,
    status: source.status,
  };

  const b: EqualShape = {
    title: replica.title,
    mergeStatus: replica.mergeStatus,
    status: replica.status,
  };

  return !isEqual(a, b);
};

export const dataExchange = new DataExchange<PRExchangeModel>({
  // 1 min
  pollTime: 1000 * 60 * 1,
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
    const notionUsers = await prismaSharedClient.guildUser.getNotionUsers();
    const releaseItems = await azureSharedClient.getReleaseItems();

    return releaseItems.map(
      (item): PRExchangeModel => ({
        ...item,
        notionUserId: notionUsers.find(
          ({ azureUserId }) => item.authorId === azureUserId
        )?.notionUserId,
      })
    );
  },
  fetchReplica: async () => {
    const replicaData = await notion.getAllPrs();
    const data = replicaData
      .filter(({ creationDate }) => !!creationDate)
      .map(
        (page): PRExchangeModel => ({
          pageId: page.id,
          pullRequestId: page.pullRequestId,
          title: page.title,
          author: page.author,
          creationDate: dayjs(page.creationDate).toISOString(),
          url: page.url,
          mergeStatus: page.mergeStatus as PullRequestModel["mergeStatus"],
          status: page.status as PullRequestModel["status"],
          commitId: page.commitId,
          notionUserId: page.notionUserId,
        })
      );
    return data;
  },
  isEqual: ({ source, replica }) => {
    if (!source.length || !replica.length) {
      return true;
    }

    for (const sourceItem of source) {
      const replicaItem = findReplicaItem(replica, {
        pullRequestId: sourceItem.pullRequestId,
        url: sourceItem.url,
        commitId: sourceItem.commitId,
        title: sourceItem.title,
      });

      if (replicaItem) {
        if (shouldUpdate(sourceItem, replicaItem)) {
          return false;
        }
      } else {
        return false;
      }
    }

    return true;
  },
  insert: async ({ source, replica }) => {
    const status: Omit<LastExchangeStatus<PRExchangeModel>, "iteration"> = {
      inserts: [],
      updates: [],
      timestamp: new Date().toString(),
    };

    if (!source.length || !replica.length) {
      return status;
    }

    for (const sourceItem of source) {
      const replicaItem = findReplicaItem(replica, {
        pullRequestId: sourceItem.pullRequestId,
        url: sourceItem.url,
        commitId: sourceItem.commitId,
        title: sourceItem.title,
      });

      if (replicaItem) {
        if (shouldUpdate(sourceItem, replicaItem) && replicaItem.pageId) {
          console.log(
            `update: ${sourceItem.title} | ${sourceItem.author} | ${sourceItem.notionUserId} | commitId: ${sourceItem.commitId}`
          );
          status.updates.push(sourceItem);
          await notion.upsertPr(sourceItem, replicaItem.pageId);
        }
      } else {
        console.log(
          `insert: ${sourceItem.title} | ${sourceItem.author}| commitId: ${sourceItem.commitId}`
        );
        status.inserts.push(sourceItem);
        await notion.upsertPr(sourceItem);
      }
    }

    return status;
  },
});

export const dataExchangeRouter = express.Router();

dataExchangeRouter.get("/status", async (_, res) => {
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

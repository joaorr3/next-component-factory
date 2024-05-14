import dayjs from "dayjs";
import express from "express";
import { find, isEqual } from "lodash";
import { z } from "zod";
import type { PullRequestModel } from "../../shared/azure";
import { azureSharedClient } from "../../shared/azure";
import notion from "../../shared/notion";
import { DataExchange, getPullRequestUrl } from "../../shared/utils";

type PRExchangeModel = {
  /**
   * Notion
   */
  pageId?: string;
  pullRequestId: string;
  title: string;
  author?: string;
  creationDate?: string;
  url?: string;
  mergeStatus: PullRequestModel["mergeStatus"];
  status: PullRequestModel["status"];
};

export const dataExchangeBodySchema = z.object({
  action: z.enum(["start", "stop"]).optional(),
  pollTime: z.string().optional(),
});

export type DataExchangeBodySchema = z.infer<typeof dataExchangeBodySchema>;

const findReplicaItem = (
  replica: PRExchangeModel[],
  params: Pick<PRExchangeModel, "url" | "pullRequestId">
) => {
  return find(
    replica,
    (r) => r.url === params.url || r.pullRequestId === params.pullRequestId
  );
};

const equals = (source: PRExchangeModel, replica: PRExchangeModel) => {
  const { pageId: _1, creationDate: _2, ...sourceRest } = source;
  const { pageId: _3, creationDate: _4, ...replicaRest } = replica;
  return isEqual(sourceRest, replicaRest);
};

export const dataExchange = new DataExchange<PRExchangeModel[]>({
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
    const sourceData = await azureSharedClient.getPullRequests();
    const data = sourceData.map(
      (pr): PRExchangeModel => ({
        pullRequestId: String(pr.pullRequestId),
        title: pr.title!,
        author: pr.createdBy?.displayName!,
        creationDate: dayjs(pr.creationDate as unknown as string).toISOString(),
        url: getPullRequestUrl(String(pr.pullRequestId)),
        mergeStatus: pr.mergeStatus || "notSet",
        status: pr.status,
      })
    );
    return data;
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
        })
      );
    return data;
  },
  isEqual: ({ source, replica }) => {
    if (!source || !replica) {
      return false;
    }

    for (const sourceItem of source) {
      const replicaItem = findReplicaItem(replica, {
        pullRequestId: sourceItem.pullRequestId,
        url: sourceItem.url,
      });

      if (replicaItem) {
        if (!equals(sourceItem, replicaItem)) {
          return false;
        }
      } else {
        return false;
      }
    }

    return true;
  },
  insert: async ({ source, replica }) => {
    if (!source || !replica) {
      return;
    }

    for (const sourceItem of source) {
      const replicaItem = findReplicaItem(replica, {
        pullRequestId: sourceItem.pullRequestId,
        url: sourceItem.url,
      });

      if (replicaItem) {
        if (!equals(sourceItem, replicaItem) && replicaItem.pageId) {
          await notion.upsertPr(sourceItem, replicaItem.pageId);
        }
      } else {
        await notion.upsertPr(sourceItem);
      }
    }
  },
});

export const dataExchangeRouter = express.Router();

dataExchangeRouter.get("/status", (_, res) => {
  const { lastExchange: __, ...status } = dataExchange.getStatus();
  res.status(200).json({
    status,
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

    const { lastExchange: __, ...status } = dataExchange.getStatus();

    res.status(200).json({
      status,
    });
  } else {
    res.status(400).json(payload.error.toString());
  }
});

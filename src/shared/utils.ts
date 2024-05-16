import { kebabCase, lowerCase } from "lodash";
import slugify from "slugify";
import { ErrorHandler } from "../utils/error";
import { acceptedFileTypes } from "./dataUtils";

export const derive = <T>(fn: () => T): T => fn();

export async function promisify<T extends () => void>(
  cb: T,
  debugMessage?: string
) {
  return Promise.resolve()
    .then(() => {
      cb();
    })
    .catch((error) => {
      const errorMessage = {
        label: "[promisify]",
        details: debugMessage || "",
        error,
      };

      console.error("[promisify] -> ", JSON.stringify(errorMessage));
    });
}

export const wait = (t: number) =>
  new Promise((resolve) => setTimeout(resolve, t));

export const normalizeLabLabel = (name: string, suffix?: boolean) => {
  const normalized = kebabCase(lowerCase(name));
  if (suffix) {
    return `${normalized}-lab`;
  }
  return normalized;
};

export const slug = (text: string) =>
  slugify(text, {
    replacement: "_",
    lower: true,
  });

export const getFileTypeFromUrl = (url: string) => {
  const acceptedFileTypesMap = acceptedFileTypes.map((item) => item.split("/"));
  const extensionMatch = url.match(/\.([^.?]+)(?:\?|$)/);
  if (extensionMatch) {
    const extension = extensionMatch[1];
    const ft = acceptedFileTypesMap.find(([ft, ext]) =>
      ext === extension ? ft : false
    );
    return ft?.[0] as "image" | "video";
  }
  return null;
};

export const getPullRequestUrl = (id?: string) =>
  `https://dev.azure.com/ptbcp/IT.DIT/_git/BCP.DesignSystem/pullrequest/${id}`;

export type DataExchangeMetrics = {
  source: {
    calls: number;
    dataLength: number;
  };
  replica: {
    calls: number;
    dataLength: number;
  };
  insert: {
    calls: number;
    dataLength: number;
  };
  isEqualFn: {
    calls: number;
  };
};

export type LastExchangeStatus<T> = {
  iteration: number;
  updates: T[];
  inserts: T[];
  timestamp?: string;
};

export class DataExchange<T> {
  private source: T[] = [];
  private replica: T[] = [];
  private isEqual = false;
  iteration = 0;
  sourceCalls = 0;
  replicaCalls = 0;
  insertCalls = 0;
  signal = true;
  pollTime = 10_000;
  isWorking = false;
  isInitialized = false;

  private metrics: DataExchangeMetrics = {
    source: {
      calls: 0,
      dataLength: 0,
    },
    replica: {
      calls: 0,
      dataLength: 0,
    },
    insert: {
      calls: 0,
      dataLength: 0,
    },
    isEqualFn: {
      calls: 0,
    },
  };

  private lastExchange: LastExchangeStatus<T> = {
    iteration: this.iteration,
    updates: [],
    inserts: [],
    timestamp: undefined,
  };

  private fetchSource: () => Promise<T[]>;
  private fetchReplica: () => Promise<T[]>;
  private isEqualFn: (props: { source: T[]; replica: T[] }) => boolean;
  private insertFn: (props: {
    source: T[];
    replica: T[];
  }) => Promise<Omit<LastExchangeStatus<T>, "iteration">>;
  private shouldFetchFn: () => boolean;

  constructor({
    pollTime,
    fetchSource,
    fetchReplica,
    isEqual,
    insert,
    shouldFetch,
  }: {
    pollTime: number;
    fetchSource: () => Promise<T[]>;
    fetchReplica: () => Promise<T[]>;
    insert: (props: {
      source: T[];
      replica: T[];
    }) => Promise<Omit<LastExchangeStatus<T>, "iteration">>;
    isEqual: (props: { source: T[]; replica: T[] }) => boolean;
    shouldFetch: () => boolean;
  }) {
    this.pollTime = pollTime;
    this.fetchSource = fetchSource;
    this.fetchReplica = fetchReplica;
    this.isEqualFn = isEqual;
    this.insertFn = insert;
    this.shouldFetchFn = shouldFetch;

    this.initialize();
  }

  private async initialize() {
    this.source = await this.fetchSource();
    this.sourceCalls++;
    this.metrics.source = {
      calls: this.sourceCalls,
      dataLength: this.source.length,
    };
    this.replica = await this.fetchReplica();
    this.replicaCalls++;
    this.metrics.replica = {
      calls: this.replicaCalls,
      dataLength: this.replica.length,
    };
    this.isInitialized = true;
  }

  public async start() {
    this.signal = true;
    if (!this.isWorking) {
      await this.initialize();
      await this.beginWork();
    }
  }

  public stop() {
    this.signal = false;
    this.isWorking = false;
    this.iteration = 0;
    this.source = [];
    this.replica = [];
    this.isEqual = false;
    this.metrics = {
      source: {
        calls: 0,
        dataLength: 0,
      },
      replica: {
        calls: 0,
        dataLength: 0,
      },
      insert: {
        calls: 0,
        dataLength: 0,
      },
      isEqualFn: {
        calls: 0,
      },
    };
    this.lastExchange = {
      iteration: this.iteration,
      updates: [],
      inserts: [],
      timestamp: undefined,
    };
  }

  @ErrorHandler({ code: "DATA_EXCHANGE", message: "beginWork Error" })
  private async beginWork() {
    if (!this.signal) {
      return;
    }

    if (this.shouldFetchFn() && this.isInitialized) {
      this.iteration++;
      this.isWorking = true;

      this.source = await this.fetchSource();
      this.sourceCalls++;
      this.metrics.source = {
        calls: this.sourceCalls,
        dataLength: this.source.length,
      };

      this.isEqual = this.isEqualFn({
        source: this.source,
        replica: this.replica,
      });

      this.metrics.isEqualFn = {
        calls: this.iteration,
      };

      if (!this.isEqual) {
        const res = await this.insertFn({
          source: this.source,
          replica: this.replica,
        });

        this.insertCalls++;
        this.metrics.insert = {
          calls: this.insertCalls,
          dataLength: res.inserts.length + res.updates.length,
        };

        this.lastExchange = {
          ...res,
          iteration: this.iteration,
        };

        this.replica = await this.fetchReplica();
        this.replicaCalls++;
        this.metrics.replica = {
          calls: this.replicaCalls,
          dataLength: this.replica.length,
        };
      }
    }

    await wait(this.pollTime);
    await this.beginWork();
  }

  public setPollTime(time: number) {
    this.pollTime = time;
  }

  public getStatus() {
    return {
      isWorking: this.isWorking,
      signal: this.signal,
      pollTime: this.pollTime,
      iterations: this.iteration,
      shouldFetch: this.shouldFetchFn(),
      lastExchange: this.lastExchange,
      metrics: this.metrics,
      isInitialized: this.isInitialized,
    };
  }

  setSignal(value: boolean) {
    this.signal = value;
  }
}

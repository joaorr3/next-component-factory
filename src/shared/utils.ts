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

export class DataExchange<T> {
  private source: T | null = null;
  private replica: T | null = null;
  private isEqual = false;
  iterations = 0;
  signal = true;
  pollTime = 10_000;
  isWorking = false;

  private fetchSource: () => Promise<T>;
  private fetchReplica: () => Promise<T>;
  private isEqualFn: (props: {
    source: T | null;
    replica: T | null;
  }) => boolean;
  private insertFn: (props: {
    source: T | null;
    replica: T | null;
  }) => Promise<void>;
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
    fetchSource: () => Promise<T>;
    fetchReplica: () => Promise<T>;
    insert: (props: { source: T | null; replica: T | null }) => Promise<void>;
    isEqual: (props: { source: T | null; replica: T | null }) => boolean;
    shouldFetch: () => boolean;
  }) {
    this.pollTime = pollTime;
    this.fetchSource = fetchSource;
    this.fetchReplica = fetchReplica;
    this.isEqualFn = isEqual;
    this.insertFn = insert;
    this.shouldFetchFn = shouldFetch;
  }

  public async start() {
    this.signal = true;
    if (!this.isWorking) {
      await this.beginWork();
    }
  }

  public stop() {
    this.signal = false;
    this.isWorking = false;
    this.iterations = 0;
    this.source = null;
    this.replica = null;
    this.isEqual = false;
  }

  @ErrorHandler({ code: "DATA_EXCHANGE", message: "beginWork Error" })
  private async beginWork() {
    if (!this.signal) {
      return;
    }

    if (this.shouldFetchFn()) {
      this.iterations++;
      this.isWorking = true;
      this.source = await this.fetchSource();

      this.isEqual = this.isEqualFn({
        source: this.source,
        replica: this.replica,
      });

      if (!this.isEqual) {
        this.replica = await this.fetchReplica();
        await this.insertFn({
          source: this.source,
          replica: this.replica,
        });
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
      iterations: this.iterations,
      shouldFetch: this.shouldFetchFn(),
    };
  }

  setSignal(value: boolean) {
    this.signal = value;
  }
}

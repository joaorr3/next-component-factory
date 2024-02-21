import { kebabCase, lowerCase } from "lodash";
import slugify from "slugify";
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
  source: T | null = null;
  replica: T | null = null;
  isEqual = false;
  signal = true;
  pollTime = 10_000;

  fetchSource: () => Promise<T>;
  fetchReplica: () => Promise<T>;
  isEqualFn: (props: { source: T | null; replica: T | null }) => boolean;
  insertFn: (props: { source: T | null; replica: T | null }) => Promise<void>;
  shouldFetchFn: () => boolean;

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

  async start() {
    if (!this.signal) {
      return;
    }

    if (this.shouldFetchFn()) {
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
    await this.start();
  }

  setSignal(value: boolean) {
    this.signal = value;
  }
}

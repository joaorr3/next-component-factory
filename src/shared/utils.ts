import { kebabCase, lowerCase } from "lodash";
import slugify from "slugify";

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

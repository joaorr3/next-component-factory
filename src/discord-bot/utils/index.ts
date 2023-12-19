import { z } from "zod";

export const csvToNumberedList = (text: string) =>
  text
    .split(";")
    .filter((step) => !!step)
    .map((item, i) => `${i + 1}. ${item}`)
    .join("\n");

export const randomInt = (min = 1, max = 10) =>
  Math.floor(Math.random() * (max - min + 1) + min);

//region URL Validation
const urlValidator = z.string().url();
export const isValidURL = (_url?: string | null) => {
  const url = urlValidator.safeParse(_url);
  return url.success;
};
//endregion

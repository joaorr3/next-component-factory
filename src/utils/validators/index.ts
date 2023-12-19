import { z } from "zod";

export const notEmptyString = z.string().refine((string) => string !== "", {
  message: "Required field",
});

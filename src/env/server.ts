/**
 * This file is included in `/next.config.mjs` which ensures the app isn't built with invalid env vars.
 * It has to be a `.mjs`-file to be imported there.
 */
import dotenv from "dotenv";
import { serverSchema } from "./schema";
// import { env as clientEnv, formatErrors } from "./client";

dotenv.config({
  path: `.env.${process.env.NODE_ENV || "local"}`,
});

const _serverEnv = serverSchema.safeParse(process.env);

if (!_serverEnv.success) {
  console.error(
    "❌ Invalid server environment variables:\n"
    // ...formatErrors(_serverEnv.error.format())
  );
  throw new Error("Invalid server environment variables");
}

for (const key of Object.keys(_serverEnv.data)) {
  if (key.startsWith("NEXT_PUBLIC_")) {
    console.warn("❌ You are exposing a server-side env-variable:", key);

    throw new Error("You are exposing a server-side env-variable");
  }
}

export const env = { ..._serverEnv.data };

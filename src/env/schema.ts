import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  NEXTAUTH_SECRET:
    process.env.NODE_ENV === "production"
      ? z.string().min(1)
      : z.string().min(1).optional(),
  NEXTAUTH_URL: z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth automatically uses the VERCEL_URL if present.
    (str) => process.env.VERCEL_URL ?? str,
    // VERCEL_URL doesnt include `https` so it cant be validated as a URL
    process.env.VERCEL ? z.string() : z.string().url()
  ),

  NODE_ENV: z.enum(["development", "test", "production"]),

  DISCORD_WEBHOOK_WORK_ITEM: z.string().url(),
  DISCORD_WEBHOOK_PR: z.string().url(),
  DISCORD_WEBHOOK_BUILD: z.string().url(),

  DISCORD_WEBHOOK_C18_URL: z.string().url(),
  DISCORD_WEBHOOK_C18_ID: z.string(),

  DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string(),
  DISCORD_BOT_TOKEN: z.string(),

  GUILD_NAME: z.string(),
  GUILD_ID: z.string(),

  NOTION_TOKEN: z.string(),
  NOTION_ISSUES_DB_ID: z.string(),

  START_DISCORD: z.string(),
  START_NOTION: z.string(),
  START_SERVER: z.string(),
  START_PRISMA: z.string(),

  DATABASE_URL: z.string().url(),
  // DATABASE_URL_RW: z.string().url(),

  AWS_S3_BUCKET: z.string(),
  AWS_S3_USER: z.string(),
  AWS_S3_ACCESS_KEY: z.string(),
  AWS_S3_SECRET_KEY: z.string(),
  AWS_S3_PUBLIC_URL: z.string().url(),

  NEXT_PROD_URL: z.string().url(),
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  // NEXT_PUBLIC_BAR: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
  // NEXT_PUBLIC_BAR: process.env.NEXT_PUBLIC_BAR,
};

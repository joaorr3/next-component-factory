// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
// !process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

import removeImports from "next-remove-imports";

const withRemoveImports = removeImports();

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "component-factory-s3-bucket.s3.eu-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "media.tenor.com",
      },
    ],
  },
  compiler: {
    styledComponents: {
      ssr: true,
      displayName: true,
    },
  },
};

export default withRemoveImports(config);

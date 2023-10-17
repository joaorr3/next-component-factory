import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { createContext } from "../../../server/trpc/context";
import { appRouter } from "../../../server/trpc/router/_app";
import type { CorsOptions, CorsOptionsDelegate } from "cors";
import cors from "cors";

function initMiddleware(middleware: typeof cors) {
  return (
    req: NextApiRequest,
    res: NextApiResponse,
    options?: CorsOptions | CorsOptionsDelegate
  ) =>
    new Promise((resolve, reject) => {
      middleware(options)(req, res, (result: Error | unknown) => {
        if (result instanceof Error) {
          return reject(result);
        }

        return resolve(result);
      });
    });
}

const NextCors = initMiddleware(cors);

const actionValidator = z.enum(["getComponentMetadata", "getComponentDetails"]);

const ONE_HOUR_IN_SECONDS = 60 * 60 * 24;

const action = async (req: NextApiRequest, res: NextApiResponse) => {
  // Create context and caller
  const ctx = await createContext({ req, res });
  const caller = appRouter.createCaller(ctx);

  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    origin: "*",
  });

  res.setHeader(
    "cache-control",
    `s-maxage=1, stale-while-revalidate=${ONE_HOUR_IN_SECONDS}`
  );

  try {
    const { action, name } = req.query;
    const validAction = actionValidator.parse(action);
    if (validAction) {
      const response = await caller.notion[validAction]({
        name: name as string,
      });
      res.status(200).json(response);
    }
  } catch (cause) {
    if (cause instanceof TRPCError) {
      // An error from tRPC occurred
      const httpCode = getHTTPStatusCodeFromError(cause);
      return res.status(httpCode).json(cause);
    }
    // Another error occurred
    console.error(cause);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default action;

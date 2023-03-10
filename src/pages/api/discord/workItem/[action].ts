import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import type { NextApiRequest, NextApiResponse } from "next";
// import { z } from "zod";
import { createContext } from "../../../../server/trpc/context";
import { appRouter } from "../../../../server/trpc/router/_app";

// const actionValidator = z.enum(["create", "update"]);

const workItem = async (req: NextApiRequest, res: NextApiResponse) => {
  // Create context and caller
  const ctx = await createContext({ req, res });
  const caller = appRouter.createCaller(ctx);

  try {
    // const { action } = req.query;
    // const validAction = actionValidator.parse(action);
    // if (validAction) {
    const response = await caller.discord.workItem(req.body);
    res.status(200).json(response);
    // }
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

export default workItem;

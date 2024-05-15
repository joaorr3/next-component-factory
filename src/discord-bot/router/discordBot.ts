import express from "express";
import { z } from "zod";
import { discordSharedClient } from "../../shared/discord";

export const discordBotAction = z.enum(["start", "destroy"]);

export type DiscordBotAction = z.infer<typeof discordBotAction>;

export const discordBotRouter = express.Router();

discordBotRouter.get("/", (req, res) => {
  res.status(200).json({
    client: discordSharedClient.client.toJSON(),
  });
});

discordBotRouter.get("/:action", (req, res) => {
  const action = discordBotAction.safeParse(req.params.action);

  if (action.success) {
    switch (action.data) {
      case "start":
        {
          discordSharedClient.start();
        }
        break;
      case "destroy":
        {
          discordSharedClient.destroy();
        }
        break;
    }

    res.status(200).json({
      action: action.data,
      client: discordSharedClient.client.toJSON(),
    });
    return;
  }

  res.status(400).json({
    error: "Invalid Action. Valid actions are start and destroy.",
  });
});

import { WebhookClient } from "discord.js";
import { env } from "../../../../env/server";
import { getArtifactUrl, npmInstallHint } from "../../../../shared/dataUtils";
import { WebhookType } from "../../../../shared/webhookType";
import {
  buildValidator,
  workItemValidator,
} from "../../../../utils/validators/discord";
import { discordNext } from "../../../discord/client";
import { publicProcedure, router } from "../../trpc";
import { prRouter } from "./pr";

export const c18WebhookClient = new WebhookClient({
  url: env.DISCORD_WEBHOOK_C18_URL,
});

export const discordRouter = router({
  build: publicProcedure.input(buildValidator).query(async ({ input }) => {
    c18WebhookClient.send({
      content: WebhookType.BUILD,
      embeds: [
        {
          author: {
            name: input.resource.requests[0].requestedFor.displayName,
            url: input.resource.requests[0].requestedFor.url,
            icon_url: input.resource.requests[0].requestedFor.imageUrl,
          },
          description: input.message.markdown,
          title: input.resource.buildNumber,
          url: getArtifactUrl(""),
          fields: [
            {
              name: "BuildNumber",
              value: input.resource.buildNumber,
              inline: true,
            },
          ],
          footer: {
            text: npmInstallHint("latest"),
          },
        },
      ],
    });

    return "OK";
  }),
  pr: prRouter,
  workItem: publicProcedure.input(workItemValidator).query(async () => {
    const msg = await discordNext.channel("webhookLogs")?.send({
      content: "Hi from Nextjs. 6",
    });

    return msg ? "OK" : "Error";
  }),
});

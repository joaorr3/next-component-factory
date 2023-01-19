import { WebhookClient } from "discord.js";
import { env } from "../../../../env/server";
import { getArtifactUrl, npmInstallHint } from "../../../../shared/dataUtils";
import { WebhookType } from "../../../../shared/webhookType";
import {
  buildValidator,
  workItemValidator,
} from "../../../../utils/validators/discord";
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
  workItem: publicProcedure
    .input(workItemValidator)
    .query(async ({ input }) => {
      c18WebhookClient.send({
        isWebhook: true,
        content: `${WebhookType.WORK_ITEM}`,
        embeds: [
          {
            author: {
              name: input.resource.fields["System.CreatedBy"],
            },
            description: input.message.markdown,
            title: input.resource.fields["System.Title"],
            fields: [
              {
                name: "AreaPath",
                value: input.resource.fields["System.AreaPath"],
                inline: true,
              },
              {
                name: "WorkItemType",
                value: input.resource.fields["System.WorkItemType"],
                inline: true,
              },
              {
                name: "State",
                value: input.resource.fields["System.State"],
                inline: true,
              },
              {
                name: "Reason",
                value: input.resource.fields["System.Reason"],
                inline: true,
              },
            ],
            url: input.resource.url,
          },
        ],
      });

      return "OK";
    }),
});

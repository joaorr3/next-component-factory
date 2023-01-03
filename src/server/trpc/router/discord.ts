import { WebhookClient } from "discord.js";
import { env } from "../../../env/server.mjs";
import { getArtifactUrl, npmInstallHint } from "../../../shared/dataUtils";
import {
  buildValidator,
  prValidator,
  workItemValidator,
} from "../../../utils/validators/discord";
import { publicProcedure, router } from "../trpc";

const webhookClient = new WebhookClient({
  url: env.DISCORD_WEBHOOK_URL,
});

export const discordRouter = router({
  release: publicProcedure.input(buildValidator).query(async ({ input }) => {
    webhookClient.send({
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
  pr: publicProcedure.input(prValidator).query(async ({ input }) => {
    webhookClient.send({
      embeds: [
        {
          author: {
            name: input.resource.createdBy.displayName,
            url: input.resource.createdBy.url,
            icon_url: input.resource.createdBy.imageUrl,
          },
          title: input.resource.title,
          description: input.resource.description,
          fields: [
            {
              name: "Source branch",
              value: input.resource.sourceRefName,
              inline: true,
            },
            {
              name: "Merge Status",
              value: input.resource.mergeStatus,
              inline: true,
            },
          ],
          url: input.resource.url,
        },
      ],
    });

    return "OK";
  }),
  workItem: publicProcedure
    .input(workItemValidator)
    .query(async ({ input }) => {
      webhookClient.send({
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

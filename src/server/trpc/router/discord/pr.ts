import dayjs from "dayjs";
import { Colors } from "discord.js";
import { c18WebhookClient } from "./index";
// import { env } from "../../../../env/server";
import { WebhookType } from "../../../../shared/webhookType";
import { prValidator } from "../../../../utils/validators/discord";
import { publicProcedure, router } from "../../trpc";

// const prWebhookClient = new WebhookClient({
//   url: env.DISCORD_WEBHOOK_PR,
// });

const cleanBranchName = (name: string) => {
  const reg = /(?<=refs\/heads\/).*$/g;
  return name.match(reg)?.[0] || name;
};

export const prRouter = router({
  create: publicProcedure.input(prValidator).query(async ({ input, ctx }) => {
    const prId = input.resource.pullRequestId;
    const azureUserId = input.resource.createdBy.id;

    const guildUser = await ctx.prisma.guildUser.findUnique({
      where: {
        azureUserId,
      },
    });

    const pr = await ctx.prisma.pullRequest.findUnique({
      where: {
        pullRequestId: String(prId),
      },
    });

    if (!pr) {
      const msg = await c18WebhookClient.send({
        content: WebhookType.PR,
        embeds: [
          {
            author: {
              name: guildUser?.friendlyName || guildUser?.username || "",
              icon_url: guildUser?.avatarURL || undefined,
            },
            title: input.resource.title,
            description: input.detailedMessage.markdown,
            color: Colors.Gold,
            fields: [
              {
                name: "Source Branch",
                value: cleanBranchName(input.resource.sourceRefName),
                inline: true,
              },
              {
                name: "Target Branch",
                value: cleanBranchName(input.resource.targetRefName),
                inline: true,
              },
              {
                name: "Merge Status",
                value: input.resource.mergeStatus,
              },
            ],
            footer: {
              text: dayjs(input.createdDate).format("HH:mm DD/MM/YYYY"),
            },
          },
        ],
      });

      if (prId && msg.id && guildUser?.id) {
        console.log("pr: ", pr);
        await ctx.prisma.pullRequest.create({
          data: {
            pullRequestId: String(prId),
            webhookMessageId: msg.id,
            guildUserId: guildUser?.id,
          },
        });
      }
    }

    return "OK - PR/CREATE";
  }),
  update: publicProcedure.input(prValidator).query(async ({ input, ctx }) => {
    const prId = input.resource.pullRequestId;
    // const azureUserId = input.resource.createdBy.id;

    // const guildUser = await ctx.prisma.guildUser.findUnique({
    //   where: {
    //     azureUserId,
    //   },
    // });

    const pr = await ctx.prisma.pullRequest.findUnique({
      where: {
        pullRequestId: String(prId),
      },
    });

    if (pr) {
      const msg = await c18WebhookClient.fetchMessage(pr.webhookMessageId);
      const embed = msg.embeds[0];
      const fields =
        msg.embeds[0].fields?.filter((_, index) => index <= 2) || [];

      await c18WebhookClient.editMessage(pr.webhookMessageId, {
        content: WebhookType.PR,
        embeds: [
          {
            ...embed,
            color: Colors.Green,
            fields: [
              ...fields,
              {
                name: "Approves (update 4)",
                value: "5",
                inline: true,
              },
            ],
          },
        ],
      });
    }

    return "OK - PR/UPDATE";
  }),
});

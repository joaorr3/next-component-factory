import { z } from "zod";
import notion from "../../../../shared/notion";
// import {
//   pullRequestCommentedOnValidator,
//   pullRequestCreatedValidator,
// } from "../../../../utils/validators/azure";
import { publicProcedure, router } from "../../trpc";

const cleanBranchName = (name: string) => {
  const reg = /(?<=refs\/heads\/).*$/g;
  return name.match(reg)?.[0] || name;
};

const authorAvatarFallback =
  "https://component-factory-s3-bucket.s3.eu-west-2.amazonaws.com/generic/bb163cab-616f-43d6-9950-b23e7ebc88ca__cf-logo.png";

export const prRouter = router({
  create: publicProcedure
    .input(z.custom<any>())
    .query(async ({ input, ctx }) => {
      try {
        console.log("stringify-create-input-shape: ", JSON.stringify(input));
      } catch (error) {
        console.log("cant stringify");
      }
      const pullRequestId = String(input.resource.pullRequestId);
      const azureUserId = input.resource.createdBy.id;
      const azureUserName = input.resource.createdBy.displayName;

      const guildUser = await ctx.prisma.guildUser.findUnique({
        where: {
          azureUserId,
        },
      });

      await notion.createPr({
        pullRequestId,
        authorName:
          guildUser?.friendlyName || guildUser?.username || azureUserName || "",
        authorAvatar: guildUser?.avatarURL || authorAvatarFallback,
        title: input.resource.title,
        description: input.detailedMessage.markdown,
        sourceBranch: cleanBranchName(input.resource.sourceRefName),
        targetBranch: cleanBranchName(input.resource.targetRefName),
        mergeStatus: input.resource.mergeStatus,
      });

      return "OK - PR/CREATE";
    }),
  updated: publicProcedure
    .input(z.custom<any>())
    .query(async ({ input, ctx }) => {
      try {
        console.log("stringify-updated-input-shape: ", JSON.stringify(input));
      } catch (error) {
        console.log("cant stringify");
      }
      const pullRequestId = String(input.resource.pullRequestId);
      const azureUserId = input.resource.createdBy.id;
      const azureUserName = input.resource.createdBy.displayName;

      const guildUser = await ctx.prisma.guildUser.findUnique({
        where: {
          azureUserId,
        },
      });

      const prPageId = await notion.getPrPageByPrId(pullRequestId);
      console.log("updated:prPageId: ", prPageId);

      if (prPageId) {
        await notion.updatePr({
          pageId: prPageId,
          data: {
            authorName:
              guildUser?.friendlyName ||
              guildUser?.username ||
              azureUserName ||
              "",
            authorAvatar: guildUser?.avatarURL || "",
            title: input.resource.title,
            description: input.detailedMessage.markdown,
            sourceBranch: cleanBranchName(input.resource.sourceRefName),
            targetBranch: cleanBranchName(input.resource.targetRefName),
            mergeStatus: input.resource.mergeStatus,
          },
        });
      }

      return "OK - PR/UPDATE";
    }),
  commented: publicProcedure.input(z.custom<any>()).query(async ({ input }) => {
    try {
      console.log("stringify-commented-input-shape: ", JSON.stringify(input));
    } catch (error) {
      console.log("cant stringify");
    }
    const pullRequestId = String(input.resource.pullRequest.pullRequestId);

    const prPageId = await notion.getPrPageByPrId(pullRequestId);
    console.log("commented:prPageId: ", prPageId);

    if (prPageId) {
      await notion.commentedPr({
        pageId: prPageId,
        data: {
          commentId: String(input.resource.comment.id),
          commentAuthorName: input.resource.comment.author.displayName,
          commentUrl: "", // input.resource.pullRequest?._links?.web?.href,
          markdown: input.message.markdown,
        },
      });
    }

    return "OK - PR/COMMENTED";
  }),
  merge: publicProcedure.input(z.custom<any>()).query(async () => {
    return "OK - PR/MERGE (Not Implemented)";
  }),
});

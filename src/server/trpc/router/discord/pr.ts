import { z } from "zod";
import notion from "../../../../shared/notion";
import {
  pullRequestCommentedOnValidator,
  pullRequestCreatedValidator,
  pullRequestUpdatedValidator,
} from "../../../../utils/validators/azure";
import { publicProcedure, router } from "../../trpc";

const cleanBranchName = (name: string) => {
  const reg = /(?<=refs\/heads\/).*$/g;
  return name.match(reg)?.[0] || name;
};

const authorAvatarFallback =
  "https://component-factory-s3-bucket.s3.eu-west-2.amazonaws.com/generic/bb163cab-616f-43d6-9950-b23e7ebc88ca__cf-logo.png";

const parseMarkdownLink = (
  markdownLink: string
): {
  label: string;
  url: string;
} => {
  const linkRegex = /\[([^\]]+)\]\(([^\)]+)\)/;
  const matches = markdownLink.match(linkRegex);
  if (!matches) {
    throw new Error(`Invalid markdown link: ${markdownLink}`);
  }
  const [, label, url] = matches;
  return { label, url };
};

export const prRouter = router({
  create: publicProcedure
    .input(pullRequestCreatedValidator)
    .query(async ({ input, ctx }) => {
      const authorId = input.resource.createdBy.id;

      const guildUser = await ctx.prisma.guildUser.findUnique({
        where: {
          azureUserId: authorId,
        },
        include: {
          notionUser: true,
        },
      });

      const notionUserId = guildUser?.notionUser?.notionUserId;

      const pullRequestId = String(input.resource.pullRequestId);
      const azureUserName = input.resource.createdBy.displayName;

      await notion.createPr({
        notionUserId,
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
    .input(pullRequestUpdatedValidator)
    .query(async ({ input, ctx }) => {
      const pullRequestId = String(input.resource.pullRequestId);
      const azureUserId = input.resource.createdBy.id;
      const azureUserName = input.resource.createdBy.displayName;

      const guildUser = await ctx.prisma.guildUser.findUnique({
        where: {
          azureUserId,
        },
      });

      const prPageId = await notion.getPrPageByPrId(pullRequestId);

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
  commented: publicProcedure
    .input(pullRequestCommentedOnValidator)
    .query(async ({ input }) => {
      const pullRequestId = String(input.resource.pullRequest.pullRequestId);
      const { label, url } = parseMarkdownLink(input.message.markdown);

      const commentAuthor = input.resource.comment.author.displayName;
      const prPageId = await notion.getPrPageByPrId(pullRequestId);

      if (prPageId && label === "commented") {
        await notion.commentedPr({
          pageId: prPageId,
          data: {
            commentId: String(input.resource.comment.id),
            commentAuthorName: commentAuthor,
            commentUrl: url,
            markdown: input.message.markdown,
          },
        });
      }

      return "OK - PR/COMMENTED";
    }),
  merge: publicProcedure.input(z.custom<any>()).query(async ({ input }) => {
    try {
      console.log("stringify-merge-input-shape: ", JSON.stringify(input));
    } catch (error) {
      console.log("cant stringify");
    }

    return "OK - PR/MERGE (Not Implemented)";
  }),
});

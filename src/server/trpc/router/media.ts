import S3 from "aws-sdk/clients/s3";
import { uuid } from "uuidv4";
import { z } from "zod";
import { env } from "../../../env/server";

import { protectedProcedure, publicProcedure, router } from "../trpc";

const getS3Url = (key: string) => {
  return `${env.AWS_S3_PUBLIC_URL}/${key}`;
};

const s3 = new S3({
  apiVersion: "2006-03-01",
  accessKeyId: env.AWS_S3_ACCESS_KEY,
  secretAccessKey: env.AWS_S3_SECRET_KEY,
  region: "eu-west-2",
  signatureVersion: "v4",
});

const BUCKET_NAME = env.AWS_S3_BUCKET;
const UPLOADING_TIME_LIMIT = 60;
const UPLOAD_MAX_FILE_SIZE = 10000000;

const s3Response = async (key: string) =>
  new Promise<S3.PresignedPost>((resolve, reject) => {
    s3.createPresignedPost(
      {
        Fields: {
          key,
        },
        Conditions: [
          ["starts-with", "$Content-Type", ""],
          ["content-length-range", 0, UPLOAD_MAX_FILE_SIZE],
        ],
        Expires: UPLOADING_TIME_LIMIT,
        Bucket: BUCKET_NAME,
      },
      (err, signed) => {
        if (err) return reject(err);
        resolve(signed);
      }
    );
  });

export const mediaRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const images = await ctx.prisma.issuesMedia.findMany();
    return images;
  }),
  uploadGenericMedia: protectedProcedure
    .input(z.object({ contentType: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input: { contentType, name } }) => {
      const userId = ctx.session.user.id;

      const imageId = uuid();
      const key = `${userId}/${imageId}`;

      const presignedPost = await s3Response(key);

      const image = await ctx.prisma.genericMedia.create({
        data: {
          id: imageId,
          key,
          url: getS3Url(key),
          contentType,
          name,
          Media: {
            create: [{ media_type: "GENERIC" }],
          },
        },
      });

      return { image, presignedPost };
    }),
  uploadIssueMedia: protectedProcedure
    .input(
      z.object({
        contentType: z.string(),
        issueId: z.number(),
        name: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { contentType, issueId, name } }) => {
      const userId = ctx.session.user.id;

      const imageId = uuid();
      const key = `${userId}/${imageId}`;

      const presignedPost = await s3Response(key);

      const image = await ctx.prisma.issuesMedia.create({
        data: {
          id: imageId,
          key,
          url: getS3Url(key),
          contentType,
          issueId,
          name,
          Media: {
            create: [{ media_type: "ISSUE" }],
          },
        },
      });

      return { image, presignedPost };
    }),
});

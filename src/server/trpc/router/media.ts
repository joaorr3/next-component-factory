import { MediaType } from "@prisma/client";
import S3 from "aws-sdk/clients/s3";
import { uuid } from "uuidv4";
import { z } from "zod";
import { env } from "../../../env/server";
import { slug } from "../../../shared/utils";
import {
  genericMediaSchemaValidator,
  issueMediaSchemaValidator,
} from "../../../utils/validators/media";

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

const s3DeleteObject = async (key: string) => {
  return new Promise<S3.DeleteObjectOutput>((resolve, reject) => {
    s3.deleteObject(
      {
        Bucket: BUCKET_NAME,
        Key: key,
      },
      (err, out) => {
        if (err) return reject(err);
        resolve(out);
      }
    );
  });
};

const s3Response = async (key: string) => {
  return new Promise<S3.PresignedPost>((resolve, reject) => {
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
};

export const mediaRouter = router({
  getAllGeneric: publicProcedure.query(async ({ ctx }) => {
    const images = await ctx.prisma.media.findMany({
      orderBy: {
        GenericMedia: {
          timestamp: "desc",
        },
      },
      include: {
        GenericMedia: true,
      },
    });
    return images.map((m) => m.GenericMedia);
  }),
  uploadGenericMedia: protectedProcedure
    .input(genericMediaSchemaValidator)
    .mutation(async ({ ctx, input: { fileType, fileName, metadata } }) => {
      const imageId = uuid();
      const key = `generic/${imageId}__${slug(fileName)}`;

      const presignedPost = await s3Response(key);

      const image = await ctx.prisma.genericMedia.create({
        data: {
          id: imageId,
          key,
          url: getS3Url(key),
          fileType,
          fileName,
          meta: JSON.stringify(metadata),
          Media: {
            create: [{ media_type: "GENERIC", s3_key: key }],
          },
        },
      });

      return { image, presignedPost };
    }),
  uploadIssueMedia: protectedProcedure
    .input(issueMediaSchemaValidator)
    .mutation(async ({ ctx, input: { fileType, fileName, metadata } }) => {
      const imageId = uuid();
      const key = `issues/${metadata.issueId}/${imageId}__${slug(fileName)}`;

      const presignedPost = await s3Response(key);

      const image = await ctx.prisma.issuesMedia.create({
        data: {
          id: imageId,
          key,
          url: getS3Url(key),
          fileType,
          fileName,
          issueId: metadata.issueId,
          meta: JSON.stringify(metadata),
          Media: {
            create: [{ media_type: "ISSUE", s3_key: key }],
          },
        },
      });

      return { image, presignedPost };
    }),
  deleteMedia: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum([MediaType.GENERIC, MediaType.ISSUE]),
        s3Key: z.string(),
      })
    )
    .mutation(async ({ ctx, input: { id, type, s3Key } }) => {
      await ctx.prisma.media.update({
        where: {
          media_id: id,
        },
        data: {
          GenericMedia: {
            delete: type === "GENERIC",
          },
          IssuesMedia: {
            delete: type === "ISSUE",
          },
        },
      });

      await s3DeleteObject(s3Key);
    }),
});

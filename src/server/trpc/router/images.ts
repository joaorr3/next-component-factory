import S3 from "aws-sdk/clients/s3";
import { uuid } from "uuidv4";
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

export const imagesRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const images = await ctx.prisma.image.findMany();
    return images;
  }),
  createPresignedUrl: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const imageId = uuid();
    const key = `${userId}/${imageId}`;

    if (key) {
      const presignedPost = await s3Response(key);

      const image = await ctx.prisma.image.create({
        data: {
          id: imageId,
          key,
          url: getS3Url(key),
        },
      });

      return { image, presignedPost };
    }
    return {
      image: undefined,
      presignedPost: { url: undefined, fields: undefined },
    };
  }),
});

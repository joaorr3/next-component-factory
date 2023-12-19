import { type MediaType } from "@prisma/client";
import React from "react";
import { derive } from "../shared/utils";
import { trpc } from "../utils/trpc";
import type { MediaSchema } from "../utils/validators/media";

export type ImageResponseModel = {
  ok: boolean;
  imageId: string;
  url: string;
};

export const useFileUpload = (mediaType: MediaType) => {
  const { mutateAsync: issue_createPresignedUrl } =
    trpc.media.uploadIssueMedia.useMutation();

  const { mutateAsync: generic_createPresignedUrl } =
    trpc.media.uploadGenericMedia.useMutation();

  const upload = React.useCallback(
    async (
      file?: File,
      metadata?: MediaSchema["metadata"]
    ): Promise<ImageResponseModel> => {
      if (!file) {
        return {
          ok: false,
          imageId: "",
          url: "",
        };
      }

      const {
        image,
        presignedPost: { url, fields },
      } = await derive(async () => {
        if (mediaType === "ISSUE" && metadata?.issueId) {
          return await issue_createPresignedUrl({
            fileType: file.type,
            fileName: file.name,
            metadata: {
              ...metadata,
              fileSize: file.size,
              issueId: metadata.issueId,
            },
          });
        } else {
          return await generic_createPresignedUrl({
            fileType: file.type,
            fileName: file.name,
            metadata: {
              ...metadata,
              fileSize: file.size,
            },
          });
        }
      });

      if (url && fields && image) {
        const formData = new FormData();

        const data = {
          ...fields,
          "Content-Type": file.type,
          file,
        } as const;

        const dataKeys = Object.keys(data) as Array<keyof typeof data>;
        dataKeys.forEach((k) => {
          const dataValue = data[k];
          if (dataValue) {
            formData.append(k, dataValue);
          }
        });

        const res = await fetch(url, {
          method: "POST",
          body: formData,
        });

        return {
          ok: res.ok,
          imageId: image.id,
          url: image.url,
        };
      }

      return {
        ok: false,
        imageId: "",
        url: "",
      };
    },
    [generic_createPresignedUrl, issue_createPresignedUrl, mediaType]
  );

  return {
    upload,
  };
};

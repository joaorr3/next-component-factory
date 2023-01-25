import { type MediaType } from "@prisma/client";
import React from "react";
import { trpc } from "../utils/trpc";

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

  const createPresignedUrl =
    mediaType === "ISSUE"
      ? issue_createPresignedUrl
      : generic_createPresignedUrl;

  const upload = React.useCallback(
    async (file?: File, issueId?: number): Promise<ImageResponseModel> => {
      if (!file || !issueId) {
        return {
          ok: false,
          imageId: "",
          url: "",
        };
      }

      const {
        image,
        presignedPost: { url, fields },
      } = await createPresignedUrl({
        contentType: file.type,
        issueId,
        name: file.name,
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
    [createPresignedUrl]
  );

  return {
    upload,
  };
};

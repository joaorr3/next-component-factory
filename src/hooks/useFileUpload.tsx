import React from "react";
import { trpc } from "../utils/trpc";

export type ImageResponseModel = {
  ok: boolean;
  imageId: string;
  url: string;
};

export const useFileUpload = () => {
  const { mutateAsync: createPresignedUrl } =
    trpc.images.createPresignedUrl.useMutation();

  const upload = React.useCallback(
    async (file?: File): Promise<ImageResponseModel> => {
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
      } = await createPresignedUrl();

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

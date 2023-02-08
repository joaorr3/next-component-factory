import dayjs from "dayjs";
import React from "react";
import { derive } from "../shared/utils";
import { baseMediaMetadataSchemaValidator } from "../utils/validators/media";
import { ContextMenu } from "./ContextMenu";
import type { MediaPreviewProps } from "./MediaPreview";
import { MediaPreview } from "./MediaPreview";

export const ListItem: React.FC<{
  headerLabel?: string | null;
  title?: string | null;
  titleSuffixElement?: JSX.Element;
  footer?: Date | null;
  author?: string | null;
  onPress?: () => void;
}> = ({ headerLabel, title, titleSuffixElement, footer, author, onPress }) => {
  return (
    <div
      onClick={onPress}
      className="mb-4 flex cursor-pointer flex-col rounded-xl bg-neutral-700 bg-opacity-25 p-4 transition-transform hover:scale-[1.01]"
    >
      {headerLabel && (
        <p className="mb-3 text-sm font-semibold text-neutral-600 text-opacity-80">
          {headerLabel}
        </p>
      )}

      <div className="flex items-center">
        <p className="text-md mr-3 font-bold">{title}</p>
        {!!titleSuffixElement ? titleSuffixElement : <React.Fragment />}
      </div>

      {footer && (
        <p className="mt-4 text-xs font-light">
          {dayjs(footer).format("DD/MM/YYYY")}
        </p>
      )}
      {author && <p className="text-xs font-bold">{author}</p>}
    </div>
  );
};

export const ListMediaItem: React.FC<{
  mediaProps: MediaPreviewProps & { metadata?: string };
  mediaId: string;
  s3Key: string;
  title?: string | null;
  titleSuffixElement?: JSX.Element;
  footer?: Date | null;
  author?: string | null;
  onPress?: () => void;
  onDeleteRequest?: (mediaId: string, s3Key: string) => void;
}> = ({
  mediaId,
  s3Key,
  mediaProps,
  title,
  footer,
  onPress,
  onDeleteRequest,
}) => {
  const metadata = derive(() => {
    if (mediaProps.metadata) {
      const rawParsed = JSON.parse(mediaProps.metadata);
      const parsedValid = baseMediaMetadataSchemaValidator
        .optional()
        .safeParse(rawParsed);

      if (parsedValid.success) {
        return parsedValid.data;
      }

      return {};
    }
  });

  return (
    <div
      onClick={onPress}
      className="relative mb-4 flex rounded-xl bg-neutral-700 bg-opacity-10 p-4"
    >
      <div className="mr-3 flex items-center">
        <MediaPreview
          {...mediaProps}
          height={100}
          width={100}
          className="cursor-pointer"
          isLink
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        {metadata?.fileSize && (
          <p className="mb-2 text-sm text-neutral-600 text-opacity-80">
            {`${metadata.fileSize / 1000} KB`}
          </p>
        )}

        <div className="flex flex-col">
          <p className="text-md mr-3 mb-3 font-bold">{title}</p>
          <p className="mr-3 w-3/4 text-xs">{mediaProps.url}</p>
        </div>

        {footer && (
          <div className="flex flex-1 items-end justify-end">
            <p className="text-xs font-light">
              {dayjs(footer).format("DD/MM/YYYY")}
            </p>
          </div>
        )}
      </div>

      <div className="absolute right-4">
        <ContextMenu
          triggerLabel="Delete"
          menuDirectionRow
          menuItems={[
            {
              label: "no",
              closeOnly: true,
            },
            {
              label: "yup",
              action: () => onDeleteRequest?.(mediaId, s3Key),
            },
          ]}
        />
      </div>
    </div>
  );
};

import { animated, useSpringValue } from "@react-spring/web";
import dayjs from "dayjs";
import Image from "next/image";
import React from "react";
import { derive } from "../shared/utils";
import { cn } from "../styles/utils";
import { baseMediaMetadataSchemaValidator } from "../utils/validators/media";
import { ContextMenu } from "./ContextMenu";
import type { MediaPreviewProps } from "./MediaPreview";
import { MediaPreview } from "./MediaPreview";

export const ListItem: React.FC<{
  headerLabel?: string | null;
  title?: string | null;
  startImageUrl?: string | null;
  titleSuffixElement?: JSX.Element;
  footer?: Date | null;
  author?: string | null;
  onPress?: () => void;
}> = ({
  headerLabel,
  title,
  startImageUrl,
  titleSuffixElement,
  footer,
  author,
  onPress,
}) => {
  return (
    <div
      onClick={onPress}
      className={cn(
        "mb-4 flex  flex-col rounded-xl bg-neutral-200 p-4 transition-transform  dark:bg-neutral-800",
        onPress ? "cursor-pointer hover:scale-[1.01]" : ""
      )}
    >
      {headerLabel && (
        <p className="mb-3 text-sm font-semibold text-neutral-600">
          {headerLabel}
        </p>
      )}

      <div className="flex">
        {startImageUrl && (
          <div className="mr-2">
            <div style={{ borderRadius: 80, overflow: "hidden" }}>
              <Image
                src={startImageUrl}
                width={24}
                height={24}
                alt="user image"
              />
            </div>
          </div>
        )}

        <div className="flex items-center">
          <p className="text-md mr-3 font-bold">{title}</p>
          {!!titleSuffixElement ? titleSuffixElement : <React.Fragment />}
        </div>
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
      className="relative mb-4 flex rounded-xl bg-neutral-200 p-4 dark:bg-neutral-800"
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

export const ListItemExpanded: React.FC<{
  headerLabel?: string | null;
  title?: string | null;
  startImageUrl?: string | null;
  titleSuffixElement?: JSX.Element;
  footer?: Date | null;
  author?: string | null;
  AdditionalInfoElement?: () => JSX.Element;
  onPress?: () => void;
}> = ({
  headerLabel,
  title,
  startImageUrl,
  titleSuffixElement,
  footer,
  author,
  AdditionalInfoElement,
}) => {
  const additionalInfoRef = React.useRef<HTMLDivElement>(null);
  const [_, setIsExpanded] = React.useState<boolean>(false);
  const [additionalInfoHeight, setAdditionalInfoHeight] =
    React.useState<number>(0);

  const Height = useSpringValue<number>(0, {
    config: {
      tension: 260,
      friction: 32,
      mass: 1,
    },
  });

  React.useLayoutEffect(() => {
    setAdditionalInfoHeight(
      additionalInfoRef.current?.getBoundingClientRect().height || 0
    );
  }, []);

  const handleOnPress = () => {
    setIsExpanded((prevIsExpanded) => {
      Height.start({
        to: !prevIsExpanded ? additionalInfoHeight : 0,
      });
      return !prevIsExpanded;
    });
  };

  return (
    <div
      onClick={handleOnPress}
      className="mb-4 flex cursor-pointer flex-col rounded-xl bg-neutral-200 p-4 transition-transform dark:bg-neutral-800"
    >
      {headerLabel && (
        <p className="mb-3 text-sm font-semibold text-neutral-600">
          {headerLabel}
        </p>
      )}

      <div className="flex">
        {startImageUrl && (
          <div className="mr-2">
            <div style={{ borderRadius: 80, overflow: "hidden" }}>
              <Image
                src={startImageUrl}
                width={24}
                height={24}
                alt="user image"
              />
            </div>
          </div>
        )}

        <div className="flex items-center">
          <p className="text-md mr-3 font-bold">{title}</p>
          {!!titleSuffixElement ? titleSuffixElement : <React.Fragment />}
        </div>
      </div>

      <animated.div style={{ overflow: "hidden", height: Height }}>
        <div ref={additionalInfoRef}>
          {AdditionalInfoElement && <AdditionalInfoElement />}
        </div>
      </animated.div>

      {footer && (
        <p className="mt-4 text-xs font-light">
          {dayjs(footer).format("DD/MM/YYYY")}
        </p>
      )}
      {author && <p className="text-xs font-bold">{author}</p>}
    </div>
  );
};

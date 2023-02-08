import React from "react";
import { ImageFallback } from "./ImageFallback";

export type MediaPreviewProps = {
  url?: string;
  contentType: string;
  onLoad?: () => void;
  width?: number;
  height?: number;
  isLink?: boolean;
  className?: string;
  onPress?: () => void;
};

export const MediaPreview = ({
  url,
  contentType,
  width = 200,
  height = 200,
  isLink,
  className,
  onPress,
  onLoad,
}: MediaPreviewProps): JSX.Element => {
  if (!url) {
    return <React.Fragment />;
  }

  if (contentType.includes("image")) {
    return (
      <ImageFallback
        alt=""
        isLink={isLink}
        src={url}
        className={className}
        width={width}
        height={height}
        onClick={onPress}
        onLoad={onLoad}
        style={{
          maxWidth: width,
          width: "100%",
          height: "auto",
        }}
      />
    );
  } else if (contentType.includes("video")) {
    return (
      <video
        src={url}
        controls
        className={className}
        width={width * 2}
        height={height * 2}
        onClick={onPress}
        onLoad={onLoad}
        style={{
          maxWidth: width * 2,
          width: "100%",
          height: "auto",
        }}
      />
    );
  }

  return <React.Fragment />;
};

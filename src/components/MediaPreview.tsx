import React from "react";
import { ImageFallback } from "./ImageFallback";

export type MediaPreviewProps = {
  url: string;
  contentType: string;
  onLoad?: () => void;
};

export const MediaPreview = ({
  url,
  contentType,
  onLoad,
}: MediaPreviewProps): JSX.Element => {
  if (contentType.includes("image")) {
    return (
      <ImageFallback
        alt=""
        src={url}
        className="m-3"
        onLoad={onLoad}
        width={200}
        height={200}
        style={{
          maxWidth: 100,
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
        onLoad={onLoad}
        className="m-3"
        width={400}
        height={400}
        style={{
          maxWidth: 200,
          width: "100%",
          height: "auto",
        }}
      />
    );
  }

  return <React.Fragment />;
};

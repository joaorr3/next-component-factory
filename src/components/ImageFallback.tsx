import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import React from "react";

export const ImageFallback = (props: ImageProps) => {
  const [error, setError] = React.useState<boolean>(false);

  return (
    <Link target="_blank" href={props.src as string}>
      <Image
        {...props}
        src={!error ? props.src : "/img_fallback.jpg"}
        alt=""
        onError={() => {
          setError(true);
        }}
      />
    </Link>
  );
};

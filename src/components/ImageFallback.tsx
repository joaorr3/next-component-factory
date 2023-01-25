import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import React from "react";

export const ImageFallback = ({
  isLink = true,
  ...props
}: ImageProps & { isLink?: boolean }) => {
  const [error, setError] = React.useState<boolean>(false);

  const src = !error ? props.src : "/img_fallback.jpg";

  if (isLink) {
    return (
      <Link
        target="_blank"
        href={props.src as string}
        style={{
          width: props.width,
        }}
      >
        <Image
          {...props}
          src={src}
          alt=""
          onError={() => {
            setError(true);
          }}
        />
      </Link>
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt=""
      onError={() => {
        setError(true);
      }}
    />
  );
};

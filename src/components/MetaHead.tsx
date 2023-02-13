import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";

export type MetaHeadProps = {
  title: string;
  url?: string;
  imageUrl?: string;
};

const defaultImageUrl =
  "https://component-factory-s3-bucket.s3.eu-west-2.amazonaws.com/generic/bb163cab-616f-43d6-9950-b23e7ebc88ca__cf-logo.png";

const basePath = "https://next-cf.up.railway.app";

export const MetaHead = ({
  title,
  url,
  imageUrl = defaultImageUrl,
}: MetaHeadProps): JSX.Element => {
  const { asPath } = useRouter();
  const fallbackPath = `${basePath}/${asPath}`;

  return (
    <Head>
      <title>{`${title}`}</title>

      <meta property="og:url" content={url || fallbackPath} />
      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={imageUrl} />
    </Head>
  );
};

import Head from "next/head";
import { env } from "../env/client";

export type MetaHeadProps = {
  title: string;
  url?: string;
  imageUrl?: string;
};

const defaultImageUrl = `${env.NEXT_PUBLIC_AWS_S3_PUBLIC_URL}/generic/bb163cab-616f-43d6-9950-b23e7ebc88ca__cf-logo.png`;

const basePath = env.NEXT_PUBLIC_PROD_URL;

export const MetaHead = ({
  title,
  url,
  imageUrl = defaultImageUrl,
}: MetaHeadProps): JSX.Element => {
  return (
    <Head>
      <title>{`${title}`}</title>

      <meta property="og:url" content={url || basePath} />
      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={imageUrl} />
    </Head>
  );
};

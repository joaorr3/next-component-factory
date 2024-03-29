import dayjs from "dayjs";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import React from "react";
import { BackButton } from "../../components/BackButton";
import MarkdownViewer from "../../components/MarkdownViewer";
import { MetaHead } from "../../components/MetaHead";
import { env } from "../../env/client";
import { useLoading } from "../../utils/GlobalState/GlobalStateProvider";
import { authLayer } from "../../utils/server-side";
import { trpc } from "../../utils/trpc";

export const getServerSideProps = authLayer(
  "FAQDetail",
  async (context: GetServerSidePropsContext<{ slug: string }>, ssg) => {
    const slug = context.params?.slug as string;
    await ssg.faq.readBySlug.prefetch({ slug });

    return {
      props: {
        trpcState: ssg.dehydrate(),
        slug,
      },
    };
  }
);

export default function FAQDetail({
  slug,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const {
    data: faqDetail,
    isLoading,
    fetchStatus,
  } = trpc.faq.readBySlug.useQuery({
    slug,
  });

  useLoading(isLoading && fetchStatus !== "idle");

  return (
    <React.Fragment>
      <MetaHead
        title={`FAQ ${faqDetail?.label}`}
        url={`${env.NEXT_PUBLIC_PROD_URL}/faqs/${faqDetail?.slug}`}
      />
      <main>
        <BackButton />

        <React.Fragment>
          <div className="mb-4 flex flex-col rounded-xl bg-neutral-100 p-5 dark:bg-neutral-800">
            {faqDetail?.type && (
              <div className="mb-3 flex items-center">
                <p className="mr-2 text-sm font-semibold text-neutral-600 text-opacity-80">
                  {faqDetail?.type}
                </p>
              </div>
            )}

            <div className="mb-8 flex items-center">
              <p className="mr-3 text-xl font-bold">{faqDetail?.label}</p>
            </div>

            {faqDetail?.markdown && (
              <MarkdownViewer
                className="md-preview"
                source={faqDetail?.markdown}
              />
            )}

            <p className="self-end text-xs font-light">
              {dayjs(faqDetail?.timestamp).format("DD/MM/YYYY")}
            </p>
          </div>
        </React.Fragment>
      </main>
    </React.Fragment>
  );
}

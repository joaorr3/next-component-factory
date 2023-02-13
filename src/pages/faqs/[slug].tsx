import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import dayjs from "dayjs";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import React from "react";
import superjson from "superjson";
import { BackButton } from "../../components/BackButton";
import MarkdownViewer from "../../components/MarkdownViewer";
import { MetaHead } from "../../components/MetaHead";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { createContextInner } from "../../server/trpc/context";
import { appRouter } from "../../server/trpc/router/_app";
import { useLoading } from "../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../utils/hoc";
import { trpc } from "../../utils/trpc";

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ slug: string }>
) {
  const { req, res } = context;

  const session = await getServerAuthSession({ req, res });

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({ session }),
    transformer: superjson,
  });

  const slug = context.params?.slug as string;
  await ssg.faq.readBySlug.prefetch({ slug });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      slug,
    },
  };
}

export default withRoles(
  "FAQDetail",
  ({ slug }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
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
          url={`https://next-cf.up.railway.app/faqs/${faqDetail?.slug}`}
        />
        <main>
          <BackButton />

          <React.Fragment>
            <div className="mb-4 flex flex-col rounded-xl bg-neutral-700 bg-opacity-25 p-5">
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
);

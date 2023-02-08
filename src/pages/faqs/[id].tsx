import dayjs from "dayjs";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { BackButton } from "../../components/BackButton";
import MarkdownViewer from "../../components/MarkdownViewer";
import { useLoading } from "../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../utils/hoc";
import { trpc } from "../../utils/trpc";

export default withRoles("FAQDetail", () => {
  const router = useRouter();
  const { id: _id } = router.query;

  const id = typeof _id === "string" ? _id : "";

  const {
    data: faqDetail,
    isLoading,
    fetchStatus,
  } = trpc.faq.read.useQuery({ id });

  useLoading(isLoading && fetchStatus !== "idle");

  return (
    <React.Fragment>
      <Head>
        <title>FAQ {faqDetail?.label}</title>
      </Head>
      <main>
        <BackButton />

        <React.Fragment>
          <div className="mb-4 flex flex-col rounded-xl bg-neutral-700 bg-opacity-25 p-4">
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
});

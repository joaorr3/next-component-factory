import Head from "next/head";
import Router from "next/router";
import React from "react";
import { BackButton } from "../../../components/BackButton";
import { InteractionElement } from "../../../components/InteractionElement";
import { ListItem } from "../../../components/ListItem";
import { routes } from "../../../routes";
import { useLoading } from "../../../utils/GlobalState/GlobalStateProvider";
import { authLayer } from "../../../utils/server-side";
import { trpc } from "../../../utils/trpc";

export const getServerSideProps = authLayer("ManageFAQs", async () => {
  return {
    props: {},
  };
});

export default function ManageFAQs() {
  const { data: faqs, isLoading, fetchStatus } = trpc.faq.readMany.useQuery();

  useLoading(isLoading && fetchStatus !== "idle");

  const handleOnPress = (slug: string) => {
    Router.push(routes.ManageFAQDetail.dynamicPath(slug));
  };

  const addFaq = () => {
    Router.push(routes.ManageFAQCreate.path);
  };

  return (
    <React.Fragment>
      <Head>
        <title>Manage / FAQs</title>
      </Head>

      <main>
        <div className="mb-12">
          <BackButton />
        </div>

        {!faqs?.length && (
          <div className="mb-6 flex items-center">
            <p className="text-xl font-bold">0 results</p>
          </div>
        )}

        <div className="relative">
          <div className="absolute right-0 -top-16">
            <InteractionElement text="Add" onPress={() => addFaq()} />
          </div>

          <div className="flex flex-col">
            {faqs?.map(({ slug, label, createdBy, timestamp }, index) => {
              return (
                <ListItem
                  key={index}
                  title={label}
                  footer={timestamp}
                  author={createdBy}
                  onPress={() => handleOnPress(slug)}
                />
              );
            })}
          </div>
        </div>
      </main>
    </React.Fragment>
  );
}

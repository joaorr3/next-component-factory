import Head from "next/head";
import Router from "next/router";
import React from "react";
import { ListItem } from "../../components/ListItem";
import { routes } from "../../routes";
import { useLoading } from "../../utils/GlobalState/GlobalStateProvider";
import { authLayer } from "../../utils/server-side";
import { trpc } from "../../utils/trpc";

const handleOnPress = (slug: string) => {
  Router.push(routes.FAQDetail.dynamicPath(slug));
};

export const getServerSideProps = authLayer("FAQs", async () => {
  return {
    props: {},
  };
});

export default function FAQs() {
  const {
    data: faqs,
    isLoading,
    fetchStatus,
  } = trpc.faq.readManyPublic.useQuery();

  useLoading(isLoading && fetchStatus !== "idle");

  return (
    <React.Fragment>
      <Head>
        <title>FAQs</title>
      </Head>

      <main>
        <div className="flex flex-col">
          {faqs?.map(({ slug, label, timestamp }, index) => {
            return (
              <ListItem
                key={index}
                title={label}
                footer={timestamp}
                onPress={() => handleOnPress(slug)}
              />
            );
          })}
        </div>
      </main>
    </React.Fragment>
  );
}

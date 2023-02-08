import Head from "next/head";
import Router from "next/router";
import React from "react";
import { ListItem } from "../../components/ListItem";
import { routes } from "../../routes";
import { useLoading } from "../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../utils/hoc";
import { trpc } from "../../utils/trpc";

const handleOnPress = (id: number) => {
  Router.push(routes.FAQDetail.dynamicPath(String(id)));
};

export default withRoles("FAQs", () => {
  const { data: faqs, isLoading, fetchStatus } = trpc.faq.readMany.useQuery();

  useLoading(isLoading && fetchStatus !== "idle");

  return (
    <React.Fragment>
      <Head>
        <title>FAQs</title>
      </Head>

      <main>
        <div className="flex flex-col">
          {faqs?.map(({ id, label, timestamp }, index) => {
            return (
              <ListItem
                key={index}
                title={label}
                footer={timestamp}
                onPress={() => handleOnPress(id)}
              />
            );
          })}
        </div>
      </main>
    </React.Fragment>
  );
});

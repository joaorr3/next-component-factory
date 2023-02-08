import Head from "next/head";
import Router from "next/router";
import React from "react";
import { BackButton } from "../../../components/BackButton";
import { InteractionElement } from "../../../components/InteractionElement";
import { ListItem } from "../../../components/ListItem";
import { routes } from "../../../routes";
import { useLoading } from "../../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../../utils/hoc";
import { trpc } from "../../../utils/trpc";

export default withRoles("ManageFAQs", () => {
  const { data: faqs, isLoading, fetchStatus } = trpc.faq.readMany.useQuery();

  useLoading(isLoading && fetchStatus !== "idle");

  const handleOnPress = (id: number) => {
    Router.push(routes.ManageFAQDetail.dynamicPath(String(id)));
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
          <div className="absolute right-0 -top-14">
            <InteractionElement text="Add" onPress={() => addFaq()} />
          </div>

          <div className="flex flex-col">
            {faqs?.map(({ id, label, createdBy, timestamp }, index) => {
              return (
                <ListItem
                  key={index}
                  title={label}
                  footer={timestamp}
                  author={createdBy}
                  onPress={() => handleOnPress(id)}
                />
              );
            })}
          </div>
        </div>
      </main>
    </React.Fragment>
  );
});

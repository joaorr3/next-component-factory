import Head from "next/head";
import Router from "next/router";
import React from "react";
import { BackButton } from "../../../components/BackButton";
import {
  FaqForm,
  type FaqFormModel,
} from "../../../components/FaqForm/FaqForm";
import { routes } from "../../../routes";
import {
  useGlobalState,
  useLoading,
} from "../../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../../utils/hoc";
import { trpc } from "../../../utils/trpc";

export default withRoles("ManageFAQCreate", () => {
  const {
    state: { user },
  } = useGlobalState();

  const { mutateAsync: createFaq, isLoading } = trpc.faq.create.useMutation();

  useLoading(isLoading);

  const handleOnSubmit = React.useCallback(
    async ({ label, type, markdown }: FaqFormModel) => {
      await createFaq({
        faq: {
          label,
          type: type || null,
          markdown,
          timestamp: new Date(),
          createdBy:
            user.profile?.friendlyName || user.profile?.username || null,
        },
      });

      Router.push(routes.ManageFAQs.path);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <React.Fragment>
      <Head>
        <title>Add FAQ</title>
      </Head>

      <main>
        <div className="mb-12">
          <BackButton />
        </div>

        <FaqForm onSubmit={handleOnSubmit} />
      </main>
    </React.Fragment>
  );
});

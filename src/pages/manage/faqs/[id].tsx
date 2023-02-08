import Head from "next/head";
import Router, { useRouter } from "next/router";
import React from "react";
import { BackButton } from "../../../components/BackButton";
import { ContextMenu } from "../../../components/ContextMenu";
import type { FaqFormModel } from "../../../components/FaqForm/FaqForm";
import { FaqForm } from "../../../components/FaqForm/FaqForm";
import { routes } from "../../../routes";
import {
  useGlobalState,
  useLoading,
} from "../../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../../utils/hoc";
import { trpc } from "../../../utils/trpc";

export default withRoles("ManageFAQDetail", () => {
  const router = useRouter();
  const { id: _id } = router.query;

  const id = typeof _id === "string" ? _id : "";

  const {
    state: { user },
  } = useGlobalState();

  const {
    data: faq,
    isLoading: isLoadingFaq,
    fetchStatus,
    refetch,
  } = trpc.faq.read.useQuery({
    id,
  });

  const { mutateAsync: updateFaq } = trpc.faq.update.useMutation();
  const { mutateAsync: deleteFaq } = trpc.faq.delete.useMutation();

  const { setLoading } = useLoading(isLoadingFaq && fetchStatus !== "idle");

  const handleOnSubmit = React.useCallback(
    async ({ label, type, markdown }: FaqFormModel) => {
      setLoading(true);
      await updateFaq({
        id,
        faq: {
          label,
          type: type || null,
          markdown,
          timestamp: new Date(),
          createdBy:
            user.profile?.friendlyName || user.profile?.username || null,
        },
      });
      await refetch();
      setLoading(false);

      Router.push(routes.ManageFAQs.path);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleDeleteFaq = React.useCallback(async () => {
    if (faq?.id) {
      setLoading(true);
      await deleteFaq({ id: String(faq.id) });
      await refetch();
      setLoading(false);
      router.push(routes.ManageFAQs.path);
    }
  }, [deleteFaq, faq?.id, refetch, router, setLoading]);

  return (
    <React.Fragment>
      <Head>
        <title>FAQ {faq?.label}</title>
      </Head>

      <main>
        <div className="mb-12">
          <BackButton />
        </div>

        <div className="relative">
          <div className="absolute right-0 -top-12">
            <ContextMenu
              triggerLabel="Delete"
              menuDirectionRow
              menuItems={[
                {
                  label: "no",
                  closeOnly: true,
                },
                {
                  label: "yup",
                  action: () => handleDeleteFaq(),
                },
              ]}
            />
          </div>

          {faq && (
            <FaqForm
              initialData={faq}
              onSubmit={handleOnSubmit}
              buttonLabel="Update"
            />
          )}
        </div>
      </main>
    </React.Fragment>
  );
});

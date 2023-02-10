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
  const { slug: _slug } = router.query;

  const slug = typeof _slug === "string" ? _slug : "";

  const {
    state: { user },
  } = useGlobalState();

  const {
    data: faq,
    isLoading: isLoadingFaq,
    fetchStatus,
    refetch,
  } = trpc.faq.readBySlug.useQuery({
    slug,
  });

  const { mutateAsync: updateFaq } = trpc.faq.update.useMutation();
  const { mutateAsync: deleteFaq } = trpc.faq.delete.useMutation();

  const { setLoading } = useLoading(isLoadingFaq && fetchStatus !== "idle");

  const handleOnSubmit = React.useCallback(
    async ({
      label,
      type,
      markdown,
      publish,
      sortingPriority,
    }: FaqFormModel) => {
      if (faq?.id) {
        setLoading(true);
        await updateFaq({
          id: String(faq.id),
          faq: {
            label,
            type: type || null,
            markdown,
            timestamp: new Date(),
            publish,
            sortingPriority: Number(sortingPriority || 0),
            createdBy:
              user.profile?.friendlyName || user.profile?.username || null,
          },
        });
        await refetch();
        setLoading(false);

        Router.push(routes.ManageFAQs.path);
      }
    },
    [
      faq?.id,
      refetch,
      setLoading,
      updateFaq,
      user.profile?.friendlyName,
      user.profile?.username,
    ]
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
              initialData={{
                ...faq,
                sortingPriority: faq.sortingPriority?.toString() || null,
              }}
              onSubmit={handleOnSubmit}
              buttonLabel="Update"
            />
          )}
        </div>
      </main>
    </React.Fragment>
  );
});

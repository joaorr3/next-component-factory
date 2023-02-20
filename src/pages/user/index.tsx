import Head from "next/head";
import React from "react";
import type { UserFormModel } from "../../components/UserPage";
import { UserPage } from "../../components/UserPage";
import { derive } from "../../shared/utils";
import {
  useGlobalState,
  useLoading,
} from "../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../utils/hoc";
import { trpc } from "../../utils/trpc";

export default withRoles("User", () => {
  const {
    state: { user },
    actions: { setDefaultUserLab },
  } = useGlobalState();

  const {
    data: defaultUserLab,
    isLoading: isLoadingDefaultUserLab,
    fetchStatus: defaultUserLabFetchStatus,
    refetch: refetchDefaultUserLab,
  } = trpc.labs.read.useQuery({
    id: user.profile?.defaultLabId || undefined,
  });

  const {
    data: userLabs,
    isLoading: isLoadingUserLabs,
    fetchStatus: userLabsFetchStatus,
    refetch: refetchUserLabs,
  } = trpc.user.userLabs.useQuery();

  const isLoading = derive(() => {
    return (
      isLoadingDefaultUserLab &&
      defaultUserLabFetchStatus !== "idle" &&
      isLoadingUserLabs &&
      userLabsFetchStatus !== "idle"
    );
  });

  const { setLoading } = useLoading(isLoading);

  const { mutateAsync: updateDefaultUserLab } =
    trpc.user.updateDefaultUserLab.useMutation();

  const { mutateAsync: updateUserLabs } =
    trpc.user.updateUserLabs.useMutation();

  const onSubmit = React.useCallback(
    async ({ labs, defaultLab }: UserFormModel) => {
      setLoading(true);

      await updateUserLabs({
        labs: labs.map((l) => l.id),
      });

      const nextDefaultLabId = derive(() => {
        const isDefaultLabStillValid = !!labs.find(
          ({ id }) => id === defaultUserLab?.id
        );

        if (isDefaultLabStillValid) {
          return defaultLab.id;
        } else {
          return labs[0]?.id || null;
        }
      });

      await updateDefaultUserLab({ defaultLabId: nextDefaultLabId });

      setDefaultUserLab(nextDefaultLabId);

      await refetchUserLabs();
      await refetchDefaultUserLab();

      setLoading(false);
    },
    [
      setLoading,
      updateUserLabs,
      updateDefaultUserLab,
      setDefaultUserLab,
      refetchUserLabs,
      refetchDefaultUserLab,
      defaultUserLab?.id,
    ]
  );

  return (
    <React.Fragment>
      <Head>
        <title>User {user?.profile?.friendlyName}</title>
      </Head>

      <main>
        <UserPage
          user={user}
          defaultUserLab={defaultUserLab}
          userLabs={userLabs}
          onSubmit={onSubmit}
        />
      </main>
    </React.Fragment>
  );
});

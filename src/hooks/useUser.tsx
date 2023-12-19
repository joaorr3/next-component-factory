import { derive } from "../shared/utils";
import { trpc } from "../utils/trpc";

export const useUser = (enabled?: boolean) => {
  const user = trpc.user.current.useQuery(undefined, {
    staleTime: 600000,
    retry: false,
    enabled,
  });

  const roles = trpc.roles.currentUser.useQuery(undefined, {
    staleTime: 600000,
    retry: false,
    enabled,
  });

  const isLoading = derive(() => {
    const loading = user.isLoading;
    const status = user.fetchStatus !== "idle";
    return loading && status;
  });

  return {
    user: user.data,
    roles: roles.data,
    isLoading,
  };
};

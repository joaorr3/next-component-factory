import { useSession } from "next-auth/react";
import { derive } from "../shared/utils";
import { trpc } from "../utils/trpc";

export const useUser = () => {
  const { status } = useSession();

  const user = trpc.user.current.useQuery(undefined, {
    enabled: status === "authenticated",
    staleTime: 600000,
    retry: false,
  });

  const roles = trpc.roles.currentUser.useQuery(undefined, {
    enabled: status === "authenticated",
    staleTime: 600000,
    retry: false,
  });

  const isLoading = derive(() => {
    const loading = user.isLoading && roles.isLoading;
    const status = user.fetchStatus !== "idle" && roles.fetchStatus !== "idle";
    return loading && status;
  });

  return {
    user: user.data,
    roles: roles.data,
    isLoading,
  };
};

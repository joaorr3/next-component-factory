import { useSession } from "next-auth/react";
import { trpc } from "../utils/trpc";

export const useUser = () => {
  const { status } = useSession();

  const user = trpc.user.current.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  const roles = trpc.roles.currentUser.useQuery(undefined, {
    enabled: status === "authenticated",
  });

  return {
    user: user.data,
    roles: roles.data,
    isLoading: user.isLoading && roles.isLoading,
  };
};

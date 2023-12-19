import { useGlobalState } from "../utils/GlobalState/GlobalStateProvider";
import { trpc } from "../utils/trpc";

export const useDefaultUserLab = (enabled = true) => {
  const {
    state: { user },
  } = useGlobalState();

  const {
    data: defaultUserLab,
    isLoading,
    fetchStatus,
  } = trpc.labs.read.useQuery(
    {
      id: user.profile?.defaultLabId || undefined,
    },
    {
      enabled,
    }
  );

  return { defaultUserLab, isLoading: isLoading && fetchStatus !== "idle" };
};

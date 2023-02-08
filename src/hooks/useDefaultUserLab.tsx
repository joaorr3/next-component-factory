import { useGlobalState } from "../utils/GlobalState/GlobalStateProvider";
import { trpc } from "../utils/trpc";

export const useDefaultUserLab = () => {
  const {
    state: { user },
  } = useGlobalState();

  const { data: defaultUserLab } = trpc.labs.read.useQuery({
    id: user.profile?.defaultLabId || undefined,
  });

  return { defaultUserLab };
};

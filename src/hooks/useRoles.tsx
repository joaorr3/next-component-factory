import { useGlobalState } from "../utils/GlobalState/GlobalStateProvider";
import type { HandleRolesModel } from "../utils/roles";
import { handleUserRoles } from "../utils/roles";

export const useRoles = (props: HandleRolesModel) => {
  const {
    state: {
      user: { roles },
    },
  } = useGlobalState();

  return handleUserRoles(roles, props);
};

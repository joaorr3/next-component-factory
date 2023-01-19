import { type Role, Roles, type RolesKeys } from "../shared/roles";
import { useGlobalState } from "../utils/GlobalState/GlobalStateProvider";

export type UseRoles = {
  anyOf?: RolesKeys[]; // needs at least one of the list
  allOf?: RolesKeys[]; // needs all of the list
};

export const useRoles = (props?: UseRoles) => {
  const {
    state: {
      user: { roles },
    },
  } = useGlobalState();

  if (!props) {
    return {
      valid: true,
      hasAnyOf: true,
      hasAllOf: true,
    };
  }

  const { anyOf, allOf } = props;

  const isAdmin = roles?.find((r) => r.id === Roles.admin);
  if (isAdmin) {
    return {
      valid: true,
      hasAnyOf: true,
      hasAllOf: true,
    };
  }

  const hasAnyOf = getAnyOf(roles, anyOf);
  const hasAllOf = getAllOf(roles, allOf);

  if (anyOf && allOf) {
    return {
      valid: hasAnyOf && hasAllOf,
      hasAnyOf,
      hasAllOf,
    };
  }

  return {
    valid: hasAnyOf || hasAllOf,
    hasAnyOf,
    hasAllOf,
  };
};

const hasRolesMap = (userRoles?: Role[], roles?: RolesKeys[]) => {
  if (!userRoles) {
    return [];
  }

  const hasRoles = roles?.map((r) => {
    const roleId = Roles[r];
    const has = !!userRoles?.find(({ id }) => id === roleId);
    return {
      r,
      has,
    };
  });

  return hasRoles;
};

const getAnyOf = (userRoles?: Role[], anyOfRoles?: RolesKeys[]) => {
  if (!anyOfRoles) return false;
  const hasRoles = hasRolesMap(userRoles, anyOfRoles);
  const hasAllRoles = !!hasRoles?.find((r) => r.has);
  return hasAllRoles;
};

const getAllOf = (userRoles?: Role[], allOfRoles?: RolesKeys[]) => {
  if (!allOfRoles) return false;
  const hasRoles = hasRolesMap(userRoles, allOfRoles);
  const hasAllRoles = !!hasRoles?.find((r) => !r.has);
  return hasAllRoles;
};

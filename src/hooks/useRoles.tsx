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

  const isAdmin = !!roles?.find((r) => r.id === Roles.admin);
  if (isAdmin) {
    return {
      valid: true,
      hasAnyOf: true,
      hasAllOf: true,
    };
  }

  const hasAnyOf = getHasAnyOf(roles, anyOf);
  const hasAllOf = getHasAllOf(roles, allOf);

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
    return undefined;
  }

  const hasRolesMap = roles?.map((r) => {
    const roleId = Roles[r];
    const has = !!userRoles?.find(({ id }) => id === roleId);
    return {
      r,
      has,
    };
  });

  return hasRolesMap;
};

const getHasAnyOf = (userRoles?: Role[], anyOfRoles?: RolesKeys[]) => {
  if (!anyOfRoles) return false;
  const hasRoles = hasRolesMap(userRoles, anyOfRoles);

  // The user need to have at least one of the necessary roles.
  const hasAtLeastOneRole = !!hasRoles?.find((r) => r.has);
  return hasAtLeastOneRole;
};

const getHasAllOf = (userRoles?: Role[], allOfRoles?: RolesKeys[]) => {
  if (!allOfRoles) return false;
  const rolesMap = hasRolesMap(userRoles, allOfRoles);

  // If the user has all the roles necessary, this value should be zero.
  const rolesInLack = rolesMap?.filter((r) => !r.has).length;
  const hasAllOfRoles = rolesInLack === 0;
  return hasAllOfRoles;
};

import React from "react";
import { useRoles } from "../hooks/useRoles";
import type { HandleRolesModel } from "../utils/roles";
import { UnauthorizedPage } from "./UnauthorizedPage";

export type RoleLayerProps = React.PropsWithChildren<{
  roles: HandleRolesModel;
}>;

export const RoleLayer = ({ roles, children }: RoleLayerProps): JSX.Element => {
  const { valid } = useRoles(roles);

  if (!valid) {
    return <UnauthorizedPage reason="insufficientRoles" />;
  }
  return <React.Fragment>{children}</React.Fragment>;
};

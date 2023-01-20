import React from "react";
import { useRoles, type UseRoles } from "../hooks/useRoles";
import { UnauthorizedPage } from "./UnauthorizedPage";

export type RoleLayerProps = React.PropsWithChildren<{
  roles?: UseRoles;
}>;

export const RoleLayer = ({ roles, children }: RoleLayerProps): JSX.Element => {
  const { valid } = useRoles(roles);

  if (!valid) {
    return <UnauthorizedPage />;
  }
  return <React.Fragment>{children}</React.Fragment>;
};

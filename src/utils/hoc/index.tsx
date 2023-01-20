import { useSession } from "next-auth/react";
import React from "react";
import { RoleLayer } from "../../components/RoleLayer";
import { UnauthorizedPage } from "../../components/UnauthorizedPage";
import { routes, type RoutesKeys } from "../../routes";

export function withRoles<P extends object>(
  route: RoutesKeys,
  Component: React.FunctionComponent<P>
) {
  return (props: P): JSX.Element => {
    const { data } = useSession();

    if (!data?.user) {
      return <UnauthorizedPage reason="loggedOut" />;
    }

    const routeRoles = routes[route].roles;

    return (
      <RoleLayer roles={routeRoles}>
        <Component {...props} />
      </RoleLayer>
    );
  };
}

import { useSession } from "next-auth/react";
import React from "react";
import { RoleLayer } from "../../components/RoleLayer";
import { routes, type RoutesKeys } from "../../routes";

export function withRoles<P extends object>(
  Component: React.FunctionComponent<P>,
  route: RoutesKeys
) {
  return (props: P): JSX.Element => {
    const { data } = useSession();

    if (!data?.user) {
      return <React.Fragment />;
    }

    const routeRoles = routes[route].roles;

    return (
      <RoleLayer roles={routeRoles}>
        <Component {...props} />
      </RoleLayer>
    );
  };
}

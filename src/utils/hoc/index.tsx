import { useSession } from "next-auth/react";
import { RoleLayer } from "../../components/RoleLayer";
import { UnauthorizedPage } from "../../components/UnauthorizedPage";
import { routes, type RoutesKeys } from "../../routes";

export function withRoles<P extends object>(
  Component: React.FunctionComponent<P>,
  route: RoutesKeys
) {
  return (props: P): JSX.Element => {
    const { data } = useSession();

    const routeRoles = routes[route].roles;

    if (!data?.user) {
      return <UnauthorizedPage />;
    }

    return (
      <RoleLayer roles={routeRoles}>
        <Component {...props} />
      </RoleLayer>
    );
  };
}

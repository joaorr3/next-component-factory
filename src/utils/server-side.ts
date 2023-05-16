import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type { GetServerSidePropsContext } from "next";
import type { Session } from "next-auth";
import type { ParsedUrlQuery } from "querystring";
import superjson from "superjson";
import type { RoutesKeys } from "../routes";
import { routes } from "../routes";
import { getServerAuthSession } from "../server/common/get-server-auth-session";
import { createContextInner } from "../server/trpc/context";
import { appRouter } from "../server/trpc/router/_app";
import { handleUserRoles } from "./roles";

export const serverSidePropsHelper = async (session: Session | null) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({ session }),
    transformer: superjson,
  });

  return ssg;
};

export const authLayer = <
  T extends ParsedUrlQuery = ParsedUrlQuery,
  R = object
>(
  route: RoutesKeys,
  gssp: (
    context: GetServerSidePropsContext<T>,
    ssg: Awaited<ReturnType<typeof serverSidePropsHelper>>
  ) => Promise<R>,
  bypass?: boolean
) => {
  return async (context: GetServerSidePropsContext<T>) => {
    const { req, res } = context;
    const routeRoles = routes[route].roles;
    const session = await getServerAuthSession({ req, res });
    const ssg = await serverSidePropsHelper(session);

    const isPublic = routeRoles === "public";

    if (bypass || isPublic || (session?.user && routeRoles === "user")) {
      return await gssp(context, ssg);
    }

    if (!session?.user) {
      return {
        redirect: {
          destination: "/unauthorized/loggedOut",
          statusCode: 302,
        },
      };
    }

    await ssg.user.current.prefetch();
    const roles = await ssg.roles.currentUser.fetch();

    const { valid } = handleUserRoles(roles, routeRoles);

    if (!valid) {
      return {
        redirect: {
          destination: "/unauthorized/insufficientRoles",
          statusCode: 302,
        },
      };
    }

    return await gssp(context, ssg);
  };
};

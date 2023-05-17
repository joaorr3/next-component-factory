import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import { TRPCError } from "@trpc/server";
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
    ssg: Awaited<ReturnType<typeof serverSidePropsHelper>>,
    hasValidRoles?: boolean
  ) => Promise<R>,
  redirect = true
) => {
  return async (context: GetServerSidePropsContext<T>) => {
    const { req, res } = context;
    const routeRoles = routes[route].roles;
    const session = await getServerAuthSession({ req, res });
    const ssg = await serverSidePropsHelper(session);

    const isPublic = routeRoles === "public";

    if (isPublic || (session?.user && routeRoles === "user")) {
      return await gssp(context, ssg);
    }

    if (!session?.user && redirect) {
      return {
        redirect: {
          destination: "/unauthorized/loggedOut",
          statusCode: 302,
        },
      };
    }

    try {
      await ssg.user.current.prefetch();
      // Will throw TRPCError.UNAUTHORIZED if it doesn't have session
      const roles = await ssg.roles.currentUser.fetch();

      const { valid: hasValidRoles } = handleUserRoles(roles, routeRoles);

      if (!hasValidRoles && redirect) {
        /**
         * Session: TRUE;
         * REDIRECT: TRUE;
         * ROLES: FALSE
         */
        return {
          redirect: {
            destination: "/unauthorized/insufficientRoles",
            statusCode: 302,
          },
        };
      } else {
        /**
         * Session: TRUE;
         * REDIRECT: FALSE;
         * ROLES: *
         */
        return await gssp(context, ssg, hasValidRoles);
      }
    } catch (error) {
      if (error instanceof TRPCError && error.code === "UNAUTHORIZED") {
        /**
         * Session: FALSE;
         * REDIRECT: FALSE;
         * ROLES: FALSE
         */
        return await gssp(context, ssg, false);
      }
    }

    // Safety net
    return await gssp(context, ssg);
  };
};

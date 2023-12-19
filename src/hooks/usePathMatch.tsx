import { useRouter } from "next/router";
import React from "react";
import { type RouteData } from "../routes";

export const usePathMatch = () => {
  const { pathname } = useRouter();

  const handleMatch = React.useCallback(
    ({ path, match }: Pick<RouteData, "path" | "match">) => {
      if (match) {
        return match.includes(pathname);
      }

      return pathname === path;
    },
    [pathname]
  );

  return {
    matchPath: handleMatch,
  };
};

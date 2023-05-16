import { Router } from "next/router";
import React from "react";
import { useLoading } from "../utils/GlobalState/GlobalStateProvider";

export const useRouterEvents = () => {
  const { isLoading, setLoading } = useLoading("setOnly");

  const start = React.useCallback(() => {
    setLoading(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const end = React.useCallback(() => {
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", end);
    Router.events.on("routeChangeError", end);
    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", end);
      Router.events.off("routeChangeError", end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLoading;
};

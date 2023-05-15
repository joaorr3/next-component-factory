import React from "react";
import { useGlobalState } from "../utils/GlobalState/GlobalStateProvider";

export const GLobalProfileLayer = ({
  children,
}: React.PropsWithChildren): JSX.Element => {
  const {
    state: {
      user: { profile },
    },
  } = useGlobalState();

  if (!profile) {
    return <React.Fragment />;
  }

  return <React.Fragment>{children}</React.Fragment>;
};

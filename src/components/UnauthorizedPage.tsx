import React from "react";
import { useLoading } from "../utils/GlobalState/GlobalStateProvider";
import { DelayVisibility } from "./DelayVisibility";

const unauthorizedMessages = {
  default: "You must be signed in or have the right role to view this page.",
  loggedOut: "You must be signed in to view this page.",
  insufficientRoles: "You must have the right role to view this page.",
} as const;

type UnauthorizedPageProps = {
  reason?: "loggedOut" | "insufficientRoles";
};

export const UnauthorizedPage = ({ reason }: UnauthorizedPageProps) => {
  const message = unauthorizedMessages[reason || "default"];
  const { isLoading } = useLoading();

  if (isLoading) {
    return <React.Fragment />;
  }

  return (
    <div className="flex justify-center">
      <DelayVisibility delayTime={2000} transitionTime={400}>
        <p>{message}</p>
      </DelayVisibility>
    </div>
  );
};

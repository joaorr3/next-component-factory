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

  return (
    <div className="flex justify-center">
      <DelayVisibility>
        <p>{message}</p>
      </DelayVisibility>
    </div>
  );
};

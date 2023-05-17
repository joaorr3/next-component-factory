import Image from "next/image";

const unauthorizedMessages = {
  default:
    "Sorry, you're either logged out or don't have enough roles to view this page..",
  loggedOut: "You must be signed in to view this page.",
  insufficientRoles: "Sorry, you don't have enough roles to view this page..",
} as const;

type UnauthorizedPageProps = {
  reason?: "loggedOut" | "insufficientRoles";
};

export const UnauthorizedPage = ({ reason }: UnauthorizedPageProps) => {
  const message = unauthorizedMessages[reason || "default"];

  const size = 0.5;

  return (
    <div className="flex flex-col items-center justify-center">
      <p className="mb-14">{message}</p>

      <Image
        alt="sad-cat-gif"
        src="https://media.tenor.com/9z8aTaVmPfwAAAAi/cats-sad.gif"
        width={390 * size}
        height={498 * size}
      />
    </div>
  );
};

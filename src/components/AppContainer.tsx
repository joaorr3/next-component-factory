import React from "react";

export const AppContainer = ({
  children,
}: React.PropsWithChildren): JSX.Element => {
  return <main className="mx-auto mt-8 max-w-4xl px-10 py-5">{children}</main>;
};

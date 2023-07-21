import React from "react";

export const AppContainer = ({
  children,
}: React.PropsWithChildren): JSX.Element => {
  return (
    <main className=" mx-auto mt-8 max-w-6xl px-4 py-5 sm:px-6 md:px-8">
      {children}
    </main>
  );
};

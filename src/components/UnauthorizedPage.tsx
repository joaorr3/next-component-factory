import React from "react";

export const UnauthorizedPage = (): JSX.Element => {
  return (
    <div className="flex justify-center">
      <p>You must be signed in or have the right role to view this page.</p>
    </div>
  );
};

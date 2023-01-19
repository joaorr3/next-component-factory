import React from "react";

export const UnauthorizedPage = (): JSX.Element => {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <p>You must be signed in or have the right role to view this page.</p>
    </div>
  );
};

import React from "react";
import { useLoading } from "../utils/GlobalState/GlobalStateProvider";

export const NotFoundPage = () => {
  const { isLoading } = useLoading();

  if (isLoading) {
    return <React.Fragment />;
  }

  return (
    <div className="flex justify-center">
      <p>Not Found</p>
    </div>
  );
};

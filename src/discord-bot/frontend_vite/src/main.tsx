import { StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import React from "react";
import { App } from "./App";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const Root = (): JSX.Element => {
  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
};

root.render(<Root />);

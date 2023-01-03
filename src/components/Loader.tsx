import React from "react";
import { Overlay } from "./base";

const Loader = () => {
  return (
    <Overlay>
      <div
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
          display: "flex",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <p>Loading...</p>
      </div>
    </Overlay>
  );
};

export default Loader;

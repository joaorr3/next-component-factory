import Head from "next/head";
import React from "react";

export default function Storybook() {
  return (
    <React.Fragment>
      <Head>
        <title>Storybook</title>
      </Head>

      <div style={{ position: "fixed", inset: "80px 0px 0px" }}>
        <iframe
          src="https://design-system-storybook-next.netlify.app"
          frameBorder="0"
          style={{
            width: "100vw",
            height: "calc(100vh - 80px)",
          }}
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        ></iframe>
      </div>
    </React.Fragment>
  );
}

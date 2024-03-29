import Head from "next/head";
import React from "react";
import { Kudos } from "../components/Kudos";

export default function Home() {
  return (
    <React.Fragment>
      <Head>
        <title>Home</title>
      </Head>
      <main>
        <iframe
          src="https://discord.com/widget?id=973878486739591208&theme=dark"
          width="100%"
          height="500"
          frameBorder="0"
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        ></iframe>

        <div className="mt-24">
          <Kudos />
        </div>
      </main>
    </React.Fragment>
  );
}

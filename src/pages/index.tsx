import Head from "next/head";
import React from "react";
import { withRoles } from "../utils/hoc";

export default withRoles("Home", () => {
  return (
    <React.Fragment>
      <Head>
        <title>Home</title>
      </Head>
      <main>
        <div>
          <h1>...</h1>
        </div>
      </main>
    </React.Fragment>
  );
});

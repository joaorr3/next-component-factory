import Head from "next/head";
import React from "react";

import { withRoles } from "../../utils/hoc";

export default withRoles("Manage", () => {
  return (
    <React.Fragment>
      <Head>
        <title>Manage</title>
      </Head>
      <main>
        <p>Manage</p>
      </main>
    </React.Fragment>
  );
});

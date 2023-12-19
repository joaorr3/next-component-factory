import Head from "next/head";
import React from "react";
import { Kudos } from "../../components/Kudos";
import { withRoles } from "../../utils/hoc";

export default withRoles("Kudos", () => {
  return (
    <React.Fragment>
      <Head>
        <title>Kudos</title>
      </Head>
      <main>
        <Kudos />
      </main>
    </React.Fragment>
  );
});

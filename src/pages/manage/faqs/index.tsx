import Head from "next/head";
import React from "react";
import { withRoles } from "../../../utils/hoc";

export default withRoles("FAQs", () => {
  return (
    <React.Fragment>
      <Head>
        <title>FAQs</title>
      </Head>

      <div>FAQs</div>
    </React.Fragment>
  );
});

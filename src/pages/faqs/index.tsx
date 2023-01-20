import Head from "next/head";
import React from "react";
import { withRoles } from "../../utils/hoc";

export const Faqs = (): JSX.Element => {
  return (
    <React.Fragment>
      <Head>
        <title>FAQs</title>
      </Head>

      <div>FAQs</div>
    </React.Fragment>
  );
};

export default withRoles(Faqs, "FAQs");

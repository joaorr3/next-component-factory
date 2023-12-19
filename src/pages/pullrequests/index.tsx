import Head from "next/head";
import React from "react";
import PullRequestsTable from "../../components/PullRequestsTable/PullRequestsTable";

export default function Storybook() {
  return (
    <React.Fragment>
      <Head>
        <title>Storybook</title>
      </Head>

      <PullRequestsTable />
    </React.Fragment>
  );
}

import { type NextPage } from "next";
import Head from "next/head";
import React from "react";
import { withRoles } from "../utils/hoc";

const Home: NextPage = () => {
  return (
    <React.Fragment>
      <Head>
        <title>Home</title>
      </Head>
      <main>
        <div>
          <h1>Home</h1>
        </div>
      </main>
    </React.Fragment>
  );
};

export default withRoles(Home, "Home");

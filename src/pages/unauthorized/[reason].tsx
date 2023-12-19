import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import React from "react";
import { UnauthorizedPage } from "../../components/UnauthorizedPage";

type Reason = "loggedOut" | "insufficientRoles";

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ reason: Reason }>
) => {
  const reason = context.params?.reason || null;

  return {
    props: {
      reason,
    },
  };
};

export default function Unauthorized({
  reason = "loggedOut",
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  console.log("reason: ", reason);
  return (
    <React.Fragment>
      <Head>
        <title>Unauthorized</title>
      </Head>

      <UnauthorizedPage reason={reason || "loggedOut"} />
    </React.Fragment>
  );
}

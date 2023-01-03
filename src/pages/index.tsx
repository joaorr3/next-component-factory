import { type NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";

import React from "react";
import { A, P } from "../components/base";
import { useLoading } from "../utils/LoadingProvider";
import { trpc } from "../utils/trpc";

const Home: NextPage = () => {
  const hello = trpc.example.hello.useQuery({ text: "from tRPC" });
  useLoading(!hello.data);

  return (
    <React.Fragment>
      <Head>
        <title>Home</title>
      </Head>
      <main>
        <div>
          <div>
            <P>{hello.data ? hello.data.greeting : "Loading tRPC query..."}</P>
            <Link href="/dashboard">
              <A>dashboard</A>
            </Link>

            <AuthShowcase />
          </div>
        </div>
      </main>
    </React.Fragment>
  );
};

export default Home;

const AuthShowcase: React.FC = () => {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = trpc.auth.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div>
      <p>
        {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        onClick={
          sessionData
            ? () => signOut()
            : () =>
                signIn("discord", {
                  callbackUrl: "/dashboard",
                })
        }
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
};

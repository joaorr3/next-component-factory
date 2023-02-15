import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Head from "next/head";
import React from "react";
import superjson from "superjson";
import { BackButton } from "../../components/BackButton";
import { IssueDetail } from "../../components/Issue/IssueDetail";
import { MetaHead } from "../../components/MetaHead";
import { getServerAuthSession } from "../../server/common/get-server-auth-session";
import { createContextInner } from "../../server/trpc/context";
import { appRouter } from "../../server/trpc/router/_app";
import { useLoading } from "../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../utils/hoc";
import { trpc } from "../../utils/trpc";

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string }>
) {
  const { req, res } = context;

  const session = await getServerAuthSession({ req, res });

  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createContextInner({ session }),
    transformer: superjson,
  });

  const id = context.params?.id as string;
  await ssg.issues.detail.prefetch({ id });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
}

export default withRoles(
  "IssueDetail",
  ({ id }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const issue = trpc.issues.detail.useQuery({
      id,
    });

    useLoading(issue.isLoading && issue.fetchStatus !== "idle");

    return (
      <React.Fragment>
        <Head>
          <MetaHead
            title={`Issue ${id}`}
            url={`https://next-cf.up.railway.app/issue/${id}`}
          />
        </Head>

        {issue.data && (
          <div className="flex flex-col">
            <BackButton />
            <IssueDetail issue={issue.data} />
          </div>
        )}
      </React.Fragment>
    );
  }
);

import type { InferGetServerSidePropsType } from "next";
import React from "react";
import { BackButton } from "../../components/BackButton";
import { IssueDetail } from "../../components/Issue/IssueDetail";
import { MetaHead } from "../../components/MetaHead";
import { NotFoundPage } from "../../components/NotFound";
import { env } from "../../env/client";
import { routes } from "../../routes";
import { useLoading } from "../../utils/GlobalState/GlobalStateProvider";
import { authLayer } from "../../utils/server-side";
import { trpc } from "../../utils/trpc";

const Detail = ({ id }: { id: string }) => {
  const issue = trpc.issues.detail.useQuery({
    id,
  });

  const isLoading = issue.isLoading && issue.fetchStatus !== "idle";

  useLoading(isLoading);

  if (!isLoading && !issue.data) {
    return <NotFoundPage />;
  }

  if (issue.data) {
    return (
      <div className="flex flex-col">
        <BackButton href={routes.Issue.path} />
        <IssueDetail issue={issue.data} />
      </div>
    );
  }

  return <React.Fragment />;
};

export const getServerSideProps = authLayer<{ id: string }>(
  "Issue",
  async (context, ssg) => {
    const id = context.params?.id as string;

    await ssg.issues.detail.prefetch({ id });

    return {
      props: {
        id,
      },
    };
  }
);

const Page = ({
  id,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <React.Fragment>
      <MetaHead
        title={`Issue ${id}`}
        url={`${env.NEXT_PUBLIC_PROD_URL}/issue/${id}`}
      />

      <Detail id={id} />
    </React.Fragment>
  );
};

export default Page;

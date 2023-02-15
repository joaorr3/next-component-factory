import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import React from "react";
import { BackButton } from "../../components/BackButton";
import { IssueDetail } from "../../components/Issue/IssueDetail";
import { MetaHead } from "../../components/MetaHead";
import { NotFoundPage } from "../../components/NotFound";
import { useLoading } from "../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../utils/hoc";
import { trpc } from "../../utils/trpc";

const Detail = withRoles("IssueDetail", ({ id }: { id: string }) => {
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
      <React.Fragment>
        {issue.data && (
          <div className="flex flex-col">
            <BackButton />
            <IssueDetail issue={issue.data} />
          </div>
        )}
      </React.Fragment>
    );
  }

  return <React.Fragment />;
});

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ id: string }>
) {
  const id = context.params?.id as string;

  return {
    props: {
      id,
    },
  };
}

const Page = ({
  id,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <React.Fragment>
      <MetaHead
        title={`Issue ${id}`}
        url={`https://next-cf.up.railway.app/issue/${id}`}
      />

      <Detail id={id} />
    </React.Fragment>
  );
};

export default Page;

import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { BackButton } from "../../components/BackButton";
import { IssueDetail } from "../../components/Issue/IssueDetail";
import { useLoading } from "../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../utils/hoc";
import { trpc } from "../../utils/trpc";

export default withRoles("IssueDetail", () => {
  const router = useRouter();
  const { id } = router.query;

  const issue = trpc.issues.detail.useQuery({
    id: typeof id === "string" ? id : "",
  });

  useLoading(issue.isLoading && issue.fetchStatus !== "idle");

  return (
    <React.Fragment>
      <Head>
        <title>Issue {id}</title>
      </Head>

      {issue.data && (
        <div className="flex flex-col">
          <BackButton />
          <IssueDetail issue={issue.data} />
        </div>
      )}
    </React.Fragment>
  );
});

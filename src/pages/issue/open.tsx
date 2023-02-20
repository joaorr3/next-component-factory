import Head from "next/head";
import Router from "next/router";
import React from "react";
import { BackButton } from "../../components/BackButton";
import { IssueForm } from "../../components/IssueForm/IssueForm";
import { type FormSchema } from "../../components/IssueForm/models";
import { useFileUpload } from "../../hooks/useFileUpload";
import { routes } from "../../routes";
import { useLoading } from "../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../utils/hoc";
import { trpc } from "../../utils/trpc";
import type { CustomFile } from "../../utils/validators/media";

const redirect = (path: string) => {
  Router.push(path);
};

export default withRoles("IssueOpen", () => {
  const { upload } = useFileUpload("ISSUE");

  const { mutateAsync: openIssue } = trpc.issues.open.useMutation();

  const { setLoading } = useLoading("setOnly");

  const handleFilesUpload = React.useCallback(
    async (files: CustomFile[], issueId: number) => {
      return Promise.all(files.map((file) => upload(file, { issueId }))).then(
        (images) => {
          return images;
        }
      );
    },
    [upload]
  );

  const handleOnSubmit = React.useCallback(
    async ({ lab, ...data }: FormSchema) => {
      const issue = await openIssue({
        ...data,
        lab: lab.name,
        labId: lab.id,
        files: [],
      });
      if (issue.id) {
        await handleFilesUpload(data.files, issue.id);
        redirect(routes.IssueDetail.dynamicPath(String(issue.id)));
      }
      setLoading(false);
    },
    [handleFilesUpload, openIssue, setLoading]
  );

  return (
    <React.Fragment>
      <Head>
        <title>Open Issue</title>
      </Head>

      <main className="mb-40">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="mb-8">
          <p className="text-3xl font-semibold">New Issue</p>
        </div>

        <IssueForm onSubmit={handleOnSubmit} />
      </main>
    </React.Fragment>
  );
});

import Head from "next/head";
import Router from "next/router";
import React from "react";
import { BackButton } from "../../components/BackButton";
import { IssueForm } from "../../components/IssueForm/IssueForm";
import { type FormSchema } from "../../components/IssueForm/models";
import { type CustomFile } from "../../components/IssueForm/validator";
import { useFileUpload } from "../../hooks/useFileUpload";
import { routes } from "../../routes";
import { useLoading } from "../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../utils/hoc";
import { trpc } from "../../utils/trpc";

const redirect = (path: string) => {
  Router.push(path);
};

export default withRoles("IssueOpen", () => {
  const { upload } = useFileUpload("ISSUE");

  const { mutateAsync: openIssue } = trpc.issues.open.useMutation();

  const { setLoading } = useLoading();

  const handleFilesUpload = React.useCallback(
    async (files: CustomFile[], issueId: number) => {
      return Promise.all(files.map((file) => upload(file, issueId))).then(
        (images) => {
          return images;
        }
      );
    },
    [upload]
  );

  const handleOnSubmit = React.useCallback(
    async (data: FormSchema) => {
      const issue = await openIssue({
        ...data,
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
          <BackButton href={routes.Issue.path} />
        </div>

        <div className="mb-8">
          <p className="text-3xl font-semibold">New Issue</p>
        </div>

        <IssueForm onSubmit={handleOnSubmit} />
      </main>
    </React.Fragment>
  );
});

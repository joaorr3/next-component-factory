import Head from "next/head";
import Link from "next/link";
import Router from "next/router";
import React from "react";
import { BackButton } from "../../components/BackButton";
import { IssueForm } from "../../components/IssueForm/IssueForm";
import { type FormSchema } from "../../components/IssueForm/models";
import Modal from "../../components/Modal";
import { useFileUpload } from "../../hooks/useFileUpload";
import { routes } from "../../routes";
import { derive } from "../../shared/utils";
import { useLoading } from "../../utils/GlobalState/GlobalStateProvider";
import { authLayer } from "../../utils/server-side";
import { trpc } from "../../utils/trpc";
import type { CustomFile } from "../../utils/validators/media";

const redirect = (path: string) => {
  Router.push(path);
};

export const getServerSideProps = authLayer("IssueOpen", async () => {
  return {
    props: {},
  };
});

export default function IssueOpen() {
  const { upload } = useFileUpload("ISSUE");

  const {
    mutateAsync: createIssue,
    error: createIssueError,
    isError: hasCreateIssueError,
    isSuccess: hasCreateIssueSuccess,
  } = trpc.issues.createIssue.useMutation();

  const {
    mutateAsync: createNotionIssue,
    error: createNotionIssueError,
    isError: hasCreateNotionIssueError,
    isSuccess: hasCreateNotionIssueSuccess,
  } = trpc.issues.createNotionIssue.useMutation();

  const {
    mutateAsync: openThread,
    error: openThreadError,
    isError: hasOpenThreadError,
    isSuccess: hasOpenThreadSuccess,
  } = trpc.issues.openThread.useMutation();

  const {
    mutateAsync: updateNotionPage,
    error: updateNotionPageError,
    isError: hasUpdateNotionPageError,
    isSuccess: hasUpdateNotionPageSuccess,
  } = trpc.issues.updateNotionPage.useMutation();

  const {
    mutateAsync: updateIssueMapping,
    error: updateIssueMappingError,
    isError: hasUpdateIssueMappingError,
    isSuccess: hasUpdateIssueMappingSuccess,
  } = trpc.issues.updateIssueMapping.useMutation();

  const [isProceduresModalOpen, setIsProceduresModalOpen] =
    React.useState<boolean>(false);

  const { hasError, errorMessagesList } = derive(() => {
    const errorMessages = [
      createIssueError?.message,
      createNotionIssueError?.message,
      openThreadError?.message,
      updateNotionPageError?.message,
      updateIssueMappingError?.message,
    ];

    return {
      hasError:
        hasCreateIssueError ||
        hasCreateNotionIssueError ||
        hasOpenThreadError ||
        hasUpdateNotionPageError ||
        hasUpdateIssueMappingError,
      errorMessagesList: errorMessages,
    };
  });

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
      setIsProceduresModalOpen(true);
      const { issue, issueMapping } = await createIssue({
        ...data,
        lab: lab.name,
        labId: lab.id,
        files: [],
      });
      if (issue.id) {
        const attachments = await handleFilesUpload(data.files, issue.id);

        const { pageId, pageUrl } = await createNotionIssue({
          ...issue,
          attachments: attachments.map((a) => a.url),
        });

        const { threadId, threadUrl } = await openThread({
          issue,
          notionPageUrl: pageUrl,
        });

        await updateNotionPage({ pageId, threadUrl });

        await updateIssueMapping({
          mappingId: issueMapping.id,
          issueAuthor: issue.author,
          issueTitle: issue.title,
          notionPageId: pageId,
          notionPageUrl: pageUrl,
          threadId,
          threadUrl,
        });

        redirect(routes.IssueDetail.dynamicPath(String(issue.id)));
      }
    },
    [
      createIssue,
      handleFilesUpload,
      createNotionIssue,
      openThread,
      updateNotionPage,
      updateIssueMapping,
    ]
  );

  return (
    <React.Fragment>
      <Modal isOpen={hasError}>
        <div className="h-full overflow-y-auto">
          <div className="m-8 flex flex-col justify-center ">
            <p className="mb-12 text-xl">Ups...</p>

            <div>
              {errorMessagesList.map((msg, key) => {
                return <pre key={key}>{msg}</pre>;
              })}
            </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isProceduresModalOpen}>
        <div className="m-8 flex flex-col justify-center">
          <p>
            {"Phase 1: createIssue "}
            {hasCreateIssueSuccess ? "✅" : ""}
          </p>
          <p>
            {"Phase 2: createNotionIssue "}
            {hasCreateNotionIssueSuccess ? "✅" : ""}
          </p>
          <p>
            {"Phase 3: openThread "}
            {hasOpenThreadSuccess ? "✅" : ""}
          </p>
          <p>
            {"Phase 4: updateNotionPage "}
            {hasUpdateNotionPageSuccess ? "✅" : ""}
          </p>
          <p>
            {"Phase 5: updateIssueMapping "}
            {hasUpdateIssueMappingSuccess ? "✅" : ""}
          </p>
        </div>
      </Modal>

      <Head>
        <title>Open Issue</title>
      </Head>

      <main className="mb-40">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="mb-8 ">
          <div className="mb-2 flex items-center">
            <span className="mr-2 text-3xl font-semibold">New Issue</span>
            <Help />
          </div>
          <p className="text-xs">Required field *</p>
        </div>

        <IssueForm onSubmit={handleOnSubmit} />
      </main>
    </React.Fragment>
  );
}

export const Help = (): JSX.Element => {
  return (
    <span>
      <Link
        target="_blank"
        href="https://next-cf.up.railway.app/faqs/how_to_use_the_issue_form"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="20"
          width="20"
          viewBox="0 96 960 960"
          className="fill-neutral-400 hover:fill-neutral-50"
        >
          <path d="M484 809q16 0 27-11t11-27q0-16-11-27t-27-11q-16 0-27 11t-11 27q0 16 11 27t27 11Zm-35-146h59q0-26 6.5-47.5T555 566q31-26 44-51t13-55q0-53-34.5-85T486 343q-49 0-86.5 24.5T345 435l53 20q11-28 33-43.5t52-15.5q34 0 55 18.5t21 47.5q0 22-13 41.5T508 544q-30 26-44.5 51.5T449 663Zm31 313q-82 0-155-31.5t-127.5-86Q143 804 111.5 731T80 576q0-83 31.5-156t86-127Q252 239 325 207.5T480 176q83 0 156 31.5T763 293q54 54 85.5 127T880 576q0 82-31.5 155T763 858.5q-54 54.5-127 86T480 976Zm0-60q142 0 241-99.5T820 576q0-142-99-241t-241-99q-141 0-240.5 99T140 576q0 141 99.5 240.5T480 916Zm0-340Z" />
        </svg>
      </Link>
    </span>
  );
};

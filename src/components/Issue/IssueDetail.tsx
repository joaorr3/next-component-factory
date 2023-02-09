import type { IssueIdMapping } from "@prisma/client";
import { type Issue, type IssuesMedia } from "@prisma/client";
import { type ReactSlipAndSlideRef } from "@react-slip-and-slide/web";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { DataDisplay } from "../DataDisplay";
import { type FormSchema } from "../IssueForm/models";
import { MediaPreview } from "../MediaPreview";
import { Slideshow } from "../Slideshow";
import { Tag } from "../Tag";

type IssuesWithMedia = Issue & {
  IssuesMedia: IssuesMedia[];
  IssueMapping: IssueIdMapping;
};

const processMediaData = (issue: IssuesWithMedia) => {
  const fallbackToOldSchema = [issue?.attachment, issue?.attachment2]
    .filter((a) => a)
    .map(() => ({
      url: issue?.attachment || "",
      fileType: "image",
    }));

  const media = issue.IssuesMedia.length
    ? issue.IssuesMedia
    : fallbackToOldSchema;

  return media;
};

export const IssueDetail: React.FC<{
  issue: IssuesWithMedia;
  onPress?: (id?: number) => void;
}> = ({ issue, onPress }) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const slideshowRef = React.useRef<ReactSlipAndSlideRef>(null);

  const thumbs = processMediaData(issue).map(({ url, fileType }, index) => {
    if (url) {
      return (
        <MediaPreview
          className="m-3 cursor-pointer"
          key={index}
          url={url}
          contentType={fileType}
          isLink={false}
          onPress={() => {
            setIsOpen(true);
            setTimeout(() => {
              slideshowRef.current?.goTo({
                index,
                animated: true,
              });
            }, 200);
          }}
        />
      );
    }
    return <React.Fragment key={index} />;
  });

  return (
    <React.Fragment>
      <div
        onClick={onPress ? () => onPress?.(issue?.id) : undefined}
        className="mb-4 flex flex-col rounded-xl bg-neutral-700 bg-opacity-25 p-4"
      >
        <div className="mb-3 flex items-center">
          <p className="mr-2 text-sm font-semibold text-neutral-600 text-opacity-80">
            {issue?.author}
          </p>
          <p>|</p>
          <p className="ml-2 text-sm text-neutral-500 text-opacity-80">
            {issue?.lab?.toUpperCase()}
          </p>
        </div>

        <div className="mb-4 flex items-center">
          <p className="mr-3 text-xl font-bold">{issue?.title}</p>
          <Tag type={issue?.type as FormSchema["type"]} />
        </div>

        <p className="mb-8 text-sm">{issue?.description}</p>

        <DataDisplay
          nude
          data={[
            {
              label: "Version",
              value: issue?.version,
            },
            {
              label: "Steps",
              value: issue?.stepsToReproduce,
            },
            {
              label: "Component",
              value: issue?.component,
            },
            {
              label: "Severity",
              value: issue?.severity,
            },
            {
              label: "Specs",
              element: (
                <Link
                  target="_blank"
                  className="text-sm text-blue-400 underline underline-offset-4"
                  href={issue?.specs || ""}
                >
                  Link
                </Link>
              ),
            },
            {
              label: "Code",
              element: (
                <Link
                  target="_blank"
                  className="text-sm text-blue-400 underline underline-offset-4"
                  href={issue?.codeSnippet || ""}
                >
                  Link
                </Link>
              ),
            },
            {
              label: "Check Tech Lead",
              value: String(issue?.checkTechLead),
            },
            {
              label: "Check Design",
              value: String(issue?.checkDesign),
            },
            {
              label: "Scope",
              value: issue?.scope,
            },
            {
              label: "Platform",
              value: issue?.platform,
            },
            {
              label: "Discord Thread",
              element: (
                <IntegrationLink
                  url={issue?.IssueMapping.discord_thread_url}
                  service="discord"
                />
              ),
              visible: !!issue?.IssueMapping.discord_thread_url,
            },
            {
              label: "Notion Item",
              element: (
                <IntegrationLink
                  url={issue?.IssueMapping.notion_page_url}
                  service="notion"
                />
              ),
              visible: !!issue?.IssueMapping.notion_page_url,
            },
          ]}
        />

        <div className="mb-4 flex flex-wrap rounded-xl bg-neutral-900 bg-opacity-30 p-4">
          {thumbs}
        </div>

        <p className="self-end text-xs font-light">
          {dayjs(issue?.createdAt).format("DD/MM/YYYY")}
        </p>
      </div>

      <Slideshow
        ref={slideshowRef}
        data={processMediaData(issue)}
        isOpen={isOpen}
        onChange={(status) => setIsOpen(status)}
      />
    </React.Fragment>
  );
};

export const IntegrationLink = ({
  url,
  service,
}: {
  url?: string | null;
  service: "discord" | "notion";
}): JSX.Element => {
  if (url) {
    const asset = {
      discord: "/discord_logo_comp.png",
      notion: "/notion_logo_comp.png",
    } as const;

    return (
      <Link
        target="_blank"
        className="flex text-sm text-blue-400 underline underline-offset-4"
        href={url || ""}
      >
        <Image height={24} width={24} alt="" src={asset[service]} />
        <p className="ml-3">Link</p>
      </Link>
    );
  }

  return <React.Fragment />;
};

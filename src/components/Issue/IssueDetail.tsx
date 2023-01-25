import { type Issue, type IssuesMedia } from "@prisma/client";
import { type ReactSlipAndSlideRef } from "@react-slip-and-slide/web";
import dayjs from "dayjs";
import Link from "next/link";
import React from "react";
import { type FormSchema } from "../IssueForm/models";
import { MediaPreview } from "../MediaPreview";
import { Slideshow } from "../Slideshow";
import { Tag } from "../Tag";

export type PropertyProps = {
  label?: string;
  value?: string | null;
  type?: "url";
};

export const Property = ({
  label,
  value,
  type,
}: PropertyProps): JSX.Element => {
  return (
    <div className="mb-3 mr-4 flex max-w-sm shrink-0 flex-col justify-center rounded-xl bg-neutral-900 bg-opacity-30 p-5">
      <p className="mb-1 text-sm font-bold">{label}</p>

      {type === "url" ? (
        <Link
          target="_blank"
          className="text-sm text-blue-700 underline underline-offset-4"
          href={value || ""}
        >
          Link
        </Link>
      ) : (
        <p className="max-w-xl overflow-hidden overflow-ellipsis text-sm">
          {value || "N.A"}
        </p>
      )}
    </div>
  );
};

type IssuesWithMedia = Issue & {
  IssuesMedia: IssuesMedia[];
};

const processMediaData = (issue: IssuesWithMedia) => {
  const fallbackToOldSchema = [issue?.attachment, issue?.attachment2]
    .filter((a) => a)
    .map(() => ({
      url: issue?.attachment || "",
      contentType: "image",
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

  const thumbs = processMediaData(issue).map(({ url, contentType }, index) => {
    if (url) {
      return (
        <MediaPreview
          className="m-3 cursor-pointer"
          key={index}
          url={url}
          contentType={contentType}
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

        <div className="flex flex-wrap">
          <Property label="Version" value={issue?.version} />

          <Property label="Steps" value={issue?.stepsToReproduce} />

          <Property label="Component" value={issue?.component} />

          <Property label="Severity" value={issue?.severity} />

          <Property label="Specs" value={issue?.specs} type="url" />

          <Property label="Code" value={issue?.codeSnippet} type="url" />

          <Property
            label="Check Tech Lead"
            value={String(issue?.checkTechLead)}
          />

          <Property label="Check Design" value={String(issue?.checkDesign)} />

          <Property label="Scope" value={issue?.scope} />

          <Property label="Platform" value={issue?.platform} />
        </div>

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

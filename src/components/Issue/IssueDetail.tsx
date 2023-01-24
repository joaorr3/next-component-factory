import { type Issue } from "@prisma/client";
import dayjs from "dayjs";
import Link from "next/link";
import React from "react";
import { ImageFallback } from "../ImageFallback";
import { type FormSchema } from "../IssueForm/models";
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

export const IssueDetail: React.FC<{
  issue: Issue | null | undefined;
  onPress?: (id?: number) => void;
}> = ({ issue, onPress }) => {
  const thumbs = [issue?.attachment, issue?.attachment2].map((url, index) => {
    if (url) {
      return (
        <div key={index} className="">
          <ImageFallback
            alt=""
            src={url}
            className="m-3"
            width={200}
            height={200}
            style={{
              maxWidth: 100,
              width: "100%",
              height: "auto",
              // objectFit: "cover",
              // height: 100,
              // width: "100%",
              // objectPosition: "left top",
            }}
          />
        </div>
      );
    }
    return <React.Fragment key={index} />;
  });

  return (
    <div
      onClick={() => onPress?.(issue?.id)}
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

        <Property label="Type" value={issue?.type} />

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

      <div className="mb-4 flex rounded-xl bg-neutral-900 bg-opacity-30 p-4">
        {thumbs}
      </div>

      <p className="self-end text-xs font-light">
        {dayjs(issue?.createdAt).format("DD/MM/YYYY")}
      </p>
    </div>
  );
};

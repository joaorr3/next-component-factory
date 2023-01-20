import { type Issue } from "@prisma/client";
import dayjs from "dayjs";
import React from "react";
import { type FormSchema } from "../IssueForm/models";
import { Tag } from "../Tag";

export const IssueCard: React.FC<{
  issue: Issue | null | undefined;
  onPress?: (id?: number) => void;
}> = ({ issue, onPress }) => {
  return (
    <div
      onClick={() => onPress?.(issue?.id)}
      className="mb-4 flex cursor-pointer flex-col rounded-xl bg-neutral-700 bg-opacity-25 p-4 transition-transform hover:scale-[1.01]"
    >
      <p className="mb-3 text-sm font-semibold text-neutral-600 text-opacity-80">
        {issue?.author}
      </p>

      <div className="mb-3 flex items-center">
        <p className="text-md mr-3 font-bold">{issue?.title}</p>
        <Tag type={issue?.type as FormSchema["type"]} />
      </div>

      <p className="self-end text-xs font-light">
        {dayjs(issue?.createdAt).format("DD/MM/YYYY")}
      </p>
    </div>
  );
};

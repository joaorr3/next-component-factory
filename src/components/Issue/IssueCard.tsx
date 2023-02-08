import { type Issue } from "@prisma/client";
import React from "react";
import { type FormSchema } from "../IssueForm/models";
import { ListItem } from "../ListItem";
import { Tag } from "../Tag";

export const IssueCard: React.FC<{
  issue: Issue | null | undefined;
  onPress?: (id?: number) => void;
}> = ({ issue, onPress }) => {
  return (
    <ListItem
      title={issue?.title || ""}
      headerLabel={issue?.author}
      titleSuffixElement={<Tag type={issue?.type as FormSchema["type"]} />}
      footer={issue?.createdAt}
      onPress={() => onPress?.(issue?.id)}
    />
  );
};

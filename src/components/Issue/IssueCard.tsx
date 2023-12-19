import { type Issue } from "@prisma/client";
import Link from "next/link";
import React from "react";
import { type FormSchema } from "../IssueForm/models";
import { ListItem } from "../ListItem";
import { Tag } from "../Tag";

export const IssueCard: React.FC<{
  className?: string;
  issue: Issue | null | undefined;
  hoverEffect?: boolean;
  href?: string;
  hrefTarget?: React.HTMLAttributeAnchorTarget;
  onPress?: (id?: number) => void;
}> = ({ className, issue, href, hrefTarget, hoverEffect, onPress }) => {
  if (href) {
    return (
      <Link href={href} target={hrefTarget}>
        <ListItem
          className={className}
          title={issue?.title || ""}
          headerLabel={issue?.author}
          titleSuffixElement={<Tag type={issue?.type as FormSchema["type"]} />}
          footer={issue?.createdAt}
          scaleUp={hoverEffect}
          cursorPointer
        />
      </Link>
    );
  }
  return (
    <ListItem
      className={className}
      title={issue?.title || ""}
      headerLabel={issue?.author}
      titleSuffixElement={<Tag type={issue?.type as FormSchema["type"]} />}
      footer={issue?.createdAt}
      scaleUp={hoverEffect}
      onPress={() => onPress?.(issue?.id)}
    />
  );
};

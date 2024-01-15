import type { PullRequest} from "@prisma/client";
import Link from "next/link";
import React from "react";
import { ListItem } from "../ListItem";
import { Tag } from "../Tag";

export const PullRequestCard: React.FC<{
  className?: string;
  pr: PullRequest
}> = ({ className, pr }) => {
  return (
    <Link href={pr.url} target="_blank">
      <ListItem
        className={className}
        title={pr.title}
        headerLabel={pr?.lastAction}
        author={pr?.guildUser?.friendlyName}
        titleSuffixElement={<Tag type="feat" />}
        footer={pr.createdAt}
        footerRelative
        scaleUp
        cursorPointer
      />
    </Link>
  );
};

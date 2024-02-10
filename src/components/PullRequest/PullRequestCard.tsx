import Link from "next/link";
import React from "react";
import { ListItem } from "../ListItem";
import { Tag } from "../Tag";
import type { GuildUser, PullRequestStatus } from "@prisma/client";

type PullRequest = {
  id: number
  pullRequestId: number
  status: PullRequestStatus
  title: string
  url: string
  lastAction: string | null
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
  completedAt: Date | null
  guildUserId: string
  guildUser: GuildUser
  lastActionGuildUserId: string
}

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

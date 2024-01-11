export type ParsedMailPullRequest = {
  id: number;
  title: string;
  url: string;
};

export type ParsedMailCommit = {
  id: string;
  title: string;
  createdAt: string;
  author: string;
  url: string;
};

export type ParsedMailReviewer = {
  user: string;
  approved: boolean;
  isRequired: boolean;
};

export type ParsedMail = {
  action: string;
  author: string;
  isPublished?: boolean;
  isCompleted?: boolean;
  isCommented?: boolean;
  isCommentReplied?: boolean;
  isApproved?: boolean;
  isUpdated?: boolean;
  isAbandoned?: boolean;
  isCreated?: boolean;
  isAutoComplete?: boolean;
  pullRequest: ParsedMailPullRequest;
  comment?: string;
  reviewers?: ParsedMailReviewer[];
  commits?: ParsedMailCommit[];
};

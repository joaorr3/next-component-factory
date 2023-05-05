export enum IssueCommandOptions {
  title = "title",
  description = "description",
  version = "version",
  type = "type",
  steps = "steps",
  component = "component",
  severity = "severity",
  specs = "specs",
  snippet = "snippet",
  techlead = "techlead",
  design = "design",
  scope = "scope",
  attachment = "attachment",
  attachment2 = "attachment2",
  azure_work_item = "azure_work_item",
}

export enum IssueType {
  bug = "bug",
  cr = "cr",
  feat = "feat",
  help = "help",
  help_v2 = "help_v2",
}

export enum RoleAction {
  get = "get",
  remove = "remove",
}

export enum PrSizeOption {
  sm = "sm",
  md = "md",
  lg = "lg",
}
export enum PrOption {
  title = "title",
  id = "id",
  size = "size",
}

export enum ThreadArchiveOption {
  duration = "duration",
}

export enum ThreadArchiveOptionChoices {
  now = "now",
  "1h" = "1h",
  "1d" = "1d",
}

export enum BatchOptions {
  start_date = "start_date",
  end_date = "end_date",
}

export enum KudosOption {
  to = "to",
  type = "type",
  public = "public",
}

export enum AssignOption {
  assignee = "assignee",
}

export enum Announce {
  title = "title",
  announcement = "announcement",
  extra = "extra",
  url = "url",
  attachment = "attachment",
  mention = "mention",
}

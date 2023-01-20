import { type Issue } from "@prisma/client";

export type IssueModel = Omit<Issue, "id" | "issueIdMappingId" | "timestamp">;

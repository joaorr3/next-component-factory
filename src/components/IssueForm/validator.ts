import { z } from "zod";
import { type ImageResponseModel } from "../../hooks/useFileUpload";
import { notEmptyString } from "../../utils/validators";
import { rawFileValidator } from "../../utils/validators/media";

const baseIssueSchema = z.object({
  title: notEmptyString,
  description: z.string().min(10),
  version: notEmptyString,
  type: z.enum(["bug", "help", "feat", "cr"]),
  stepsToReproduce: notEmptyString,
  component: notEmptyString,
  severity: z.enum(["high", "medium", "low"]).optional(),
  specs: z.string().url(),
  codeSnippet: z.string().url(),
  checkTechLead: z.boolean().optional(),
  checkDesign: z.boolean().optional(),
  scope: z.enum(["dev", "design", "both"]),
  azureWorkItem: z.string().nullable().optional(),
  platform: z.enum(["WEB", "NATIVE", "CROSS"]),
});

export const issueFormSchema = baseIssueSchema.merge(
  z.object({
    lab: z.object({
      id: z.string(),
      name: z.string(),
    }),
    files: rawFileValidator,
    componentId: z.string().nullable(),
  })
);

export const issueProcedureSchema = baseIssueSchema.merge(
  z.object({
    lab: notEmptyString,
    labId: notEmptyString,
    files: z.array(z.custom<ImageResponseModel>()),
    componentId: z.string().nullable(),
  })
);

export const updateIssueProcedureSchema = z.object({
  pageId: z.string().optional(),
  attachments: z.array(z.string()),
});

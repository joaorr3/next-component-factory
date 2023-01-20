import { z } from "zod";
import { type ImageResponseModel } from "../../hooks/useFileUpload";

export type CustomFile = File & { preview: string };

const validateFiles = <T extends keyof Pick<CustomFile, "size" | "type">>(
  files: CustomFile[],
  field: {
    key: T;
    validate: (v: CustomFile[T]) => boolean;
  }
) => {
  const fst = files
    .map((file) => {
      return file[field.key];
    })
    .find((v) => !field.validate(v));

  return !fst;
};

const acceptedFileTypes = ["image/png", "image/jpeg", "image/gif"];

const fileValidator = z
  .array(z.custom<CustomFile>())
  .refine((files) => files.length !== 0, {
    message: "File is required",
  })
  .refine(
    (files) => {
      return validateFiles<"type">(files, {
        key: "type",
        validate: (v) => acceptedFileTypes.includes(v),
      });
    },
    {
      message: `File format must be one of ${acceptedFileTypes.join(", ")}`,
    }
  )
  .refine(
    (files) => {
      return validateFiles<"size">(files, {
        key: "size",
        validate: (v) => +v <= 10000000,
      });
    },
    { message: "File size must be less than or equal to 10MB" }
  );

const notEmpty = z.string().refine((string) => string !== "", {
  message: "Required field",
});

const baseIssueSchema = z.object({
  title: notEmpty,
  description: z.string().min(10),
  lab: notEmpty,
  version: notEmpty,
  type: z.enum(["bug", "help", "feat", "cr"]),
  stepsToReproduce: notEmpty,
  component: notEmpty,
  severity: z.enum(["high", "medium", "low"]),
  specs: z.string().url(),
  codeSnippet: z.string().url(),
  checkTechLead: z.boolean(),
  checkDesign: z.boolean(),
  scope: z.enum(["dev", "design", "both"]),
  azureWorkItem: z.string().nullable(),
});

export const issueFormSchema = baseIssueSchema.merge(
  z.object({
    files: fileValidator,
  })
);

export const issueProcedureSchema = baseIssueSchema.merge(
  z.object({
    files: z.array(z.custom<ImageResponseModel>()),
  })
);

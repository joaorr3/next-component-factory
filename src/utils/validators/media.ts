import { z } from "zod";
import { acceptedFileTypes } from "../../shared/dataUtils";

export const baseMediaMetadataSchemaValidator = z.object({
  fileSize: z.number().optional(),
  identifier: z.number().or(z.string()).optional(),
  issueId: z.number().optional(),
});

export const genericMediaSchemaValidator = z.object({
  fileType: z.string(),
  fileName: z.string(),
  metadata: baseMediaMetadataSchemaValidator.optional(),
});

export const issueMediaSchemaValidator = genericMediaSchemaValidator.extend({
  metadata: baseMediaMetadataSchemaValidator.extend({
    issueId: z.number(),
  }),
});

export type GenericMediaMetadataSchema = z.infer<
  typeof baseMediaMetadataSchemaValidator
>;
export type GenericMediaSchema = z.infer<typeof genericMediaSchemaValidator>;
export type IssuesMediaSchema = z.infer<typeof issueMediaSchemaValidator>;

export type MediaSchema = GenericMediaSchema | IssuesMediaSchema;

// Raw File Validator

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

export const rawFileValidator = z
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
    { message: "File size must be less or equal to 10MB" }
  );

export type FileSchemaValidator = z.infer<typeof rawFileValidator>;

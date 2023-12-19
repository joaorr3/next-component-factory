import { type z } from "zod";
import { type issueFormSchema } from "./validator";

export type FormSchema = z.infer<typeof issueFormSchema>;
export type FormSchemaKeys = keyof FormSchema;

export type IssueFormProps = {
  isPublic?: boolean;
  onSubmit?: (data: FormSchema) => void;
};

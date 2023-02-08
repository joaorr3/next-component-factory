import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as Fields from "../../components/Form/Fields";
import { notEmptyString } from "../../utils/validators";
import MarkdownEditor from "../MarkdownEditor";

export const faqFormSchema = z.object({
  label: notEmptyString,
  type: z.string().nullable(),
  markdown: z.string(),
});

export type FaqFormModel = z.infer<typeof faqFormSchema>;

export type FaqFormProps = {
  initialData?: FaqFormModel;
  onSubmit?: (data: FaqFormModel) => void;
  buttonLabel?: string;
};

export const FaqForm = ({
  initialData,
  onSubmit,
  buttonLabel,
}: FaqFormProps): JSX.Element => {
  const {
    formState,
    getFieldState,
    setValue,
    watch,
    handleSubmit,
    reset,
    register,
  } = useForm<FaqFormModel>({
    resolver: zodResolver(faqFormSchema),
    defaultValues: initialData,
  });

  const markdownValue = watch("markdown");

  const handleOnSubmit = React.useCallback(
    async (formData: FaqFormModel) => {
      return new Promise((res) => {
        onSubmit?.(formData);
        reset();
        res(formData);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(handleOnSubmit)}>
      <Fields.Text
        label="Label"
        placeholder="Ex: Faq XYZ"
        disabled={formState.isSubmitting}
        error={getFieldState("label").error}
        register={register("label")}
      />

      <Fields.Text
        label="Type"
        placeholder="Ex: Faq Type XYZ (Optional)"
        disabled={formState.isSubmitting}
        error={getFieldState("type").error}
        register={register("type")}
      />

      <Fields.BaseField
        label="Markdown"
        error={getFieldState("markdown").error}
      >
        <MarkdownEditor
          className="md-edit"
          value={markdownValue}
          height={500}
          enableScroll
          onChange={(value) => {
            setValue("markdown", value || "");
          }}
        />
      </Fields.BaseField>

      <Fields.Button className="my-12" type="submit">
        {buttonLabel || "Add"}
      </Fields.Button>
    </form>
  );
};

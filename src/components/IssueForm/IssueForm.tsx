import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { useDefaultUserLab } from "../../hooks/useDefaultUserLab";
import { useLoading } from "../../utils/GlobalState/GlobalStateProvider";
import { ComponentList } from "../ComponentList";
import * as Fields from "../Form/Fields";
import { LabList } from "../LabList";
import {
  type FormSchemaKeys,
  type FormSchema,
  type IssueFormProps,
} from "./models";
import { issueFormSchema } from "./validator";

export const IssueForm = ({ onSubmit }: IssueFormProps): JSX.Element => {
  const formRef = React.useRef<HTMLFormElement>(null);

  const { defaultUserLab, isLoading: isLoadingDefaultUserLab } =
    useDefaultUserLab();

  const {
    formState,
    register,
    getValues,
    setValue,
    getFieldState,
    handleSubmit,
    watch,
    reset,
    control,
  } = useForm<FormSchema>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      lab: {
        id: defaultUserLab?.id,
        name: defaultUserLab?.displayName || defaultUserLab?.name,
      },
    },
  });

  React.useEffect(() => {
    if (defaultUserLab) {
      setValue("lab", defaultUserLab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultUserLab]);

  const { setLoading } = useLoading();

  const resetForm = React.useCallback(() => {
    reset();
    setValue("files", []);
    formRef.current?.reset();
  }, [reset, setValue]);

  const handleOnSubmit = React.useCallback(async (data: FormSchema) => {
    setLoading(true);
    return new Promise((res) => {
      onSubmit?.(data);
      resetForm();
      res(data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getError = React.useCallback(
    (k: FormSchemaKeys) => {
      const state = getFieldState(k);
      return state.error;
    },
    [getFieldState]
  );

  return (
    <div>
      <form
        ref={formRef}
        className="flex flex-col"
        onSubmit={handleSubmit(handleOnSubmit)}
      >
        <Fields.Text
          label="Title"
          placeholder="Issue Title"
          disabled={formState.isSubmitting}
          error={getError("title")}
          required
          register={register("title")}
        />

        <Fields.Area
          className="max-h-56"
          label="Description"
          description="Try to be concise in your description"
          placeholder="Issue Description"
          disabled={formState.isSubmitting}
          error={getError("description")}
          required
          register={register("description")}
        />

        <Fields.ModalSelect
          label="Lab"
          disabled={formState.isSubmitting || !defaultUserLab}
          placeholder="Ex: M2030"
          value={watch("lab")?.name}
          description={
            !defaultUserLab?.id && !isLoadingDefaultUserLab
              ? "First, you need select your lab in user settings"
              : undefined
          }
          required
          isFieldLoading={isLoadingDefaultUserLab}
          // isFieldLoading
          error={getError("lab")}
        >
          {({ setIsOpen }) => (
            <LabList
              selectedLab={watch("lab")}
              onItemPress={(lab) => {
                setValue("lab", lab);
                setIsOpen(false);
              }}
            />
          )}
        </Fields.ModalSelect>

        <Fields.Text
          label="Package Version"
          placeholder="Ex: 3.3.0-1.0.332128"
          description="In your terminal run: npm list @bcp-nextgen-dx-component-factory/accolade-design-system --depth=0"
          disabled={formState.isSubmitting}
          error={getError("version")}
          required
          register={register("version")}
        />

        <Fields.Select
          fieldName="type"
          placeholder="Select a type"
          label="Issue Type"
          options={["bug", "help", "feat", "cr"]}
          disabled={formState.isSubmitting}
          error={getError("type")}
          required
          control={control}
        />

        <Fields.Select
          fieldName="platform"
          placeholder="Select a platform"
          label="Platform"
          options={["WEB", "NATIVE", "CROSS"]}
          disabled={formState.isSubmitting}
          error={getError("platform")}
          required
          control={control}
        />

        <Fields.Area
          className="max-h-56"
          label="Steps To Reproduce"
          placeholder={`Ex:\n 1. Dis this; \n 2. Did that;`}
          height={140}
          disabled={formState.isSubmitting}
          error={getError("stepsToReproduce")}
          required
          register={register("stepsToReproduce")}
        />

        <Fields.ModalSelect
          label="Component Name"
          disabled={formState.isSubmitting}
          placeholder="Ex: AccountCard"
          value={watch("component")}
          required
          error={getError("component")}
        >
          {({ setIsOpen }) => (
            <ComponentList
              selectedComponentName={watch("component")}
              onItemPress={({ name }) => {
                console.log("name: ", name);
                setValue("component", name);
                setIsOpen(false);
              }}
            />
          )}
        </Fields.ModalSelect>

        <Fields.Select
          fieldName="severity"
          placeholder="Select a severity"
          label="Severity"
          options={["high", "medium", "low"]}
          disabled={formState.isSubmitting}
          error={getError("severity")}
          required
          control={control}
        />

        <Fields.Text
          label="Code Snippet"
          placeholder="https://dev.azure.com/ptbcp/IT.Ignite/_git/Project.Repo"
          disabled={formState.isSubmitting}
          error={getError("codeSnippet")}
          required
          register={register("codeSnippet")}
        />

        <Fields.Text
          label="Specification Page"
          placeholder="https://www.figma.com/file/page.id"
          description="It's important that you insert a link to a specific frame instead of the whole page."
          disabled={formState.isSubmitting}
          error={getError("specs")}
          required
          register={register("specs")}
        />

        <div className="flex">
          <Fields.Toggle
            label="Checked With Tech Lead"
            checked={getValues("checkTechLead")}
            onChange={(checked) => setValue("checkTechLead", checked)}
            disabled={formState.isSubmitting}
            error={getError("checkTechLead")}
            required
            register={() => register("checkTechLead")}
          />

          <Fields.Toggle
            label="Checked With Design"
            checked={getValues("checkDesign")}
            onChange={(checked) => setValue("checkDesign", checked)}
            disabled={formState.isSubmitting}
            error={getError("checkDesign")}
            required
            register={() => register("checkDesign")}
          />
        </div>

        <Fields.Select
          fieldName="scope"
          placeholder="Select a scope"
          label="Scope"
          options={["dev", "design", "both"]}
          disabled={formState.isSubmitting}
          error={getError("scope")}
          required
          control={control}
        />

        <Fields.Text
          label="Azure Work Item"
          placeholder="Ex: 2365789"
          disabled={formState.isSubmitting}
          error={getError("azureWorkItem")}
          register={register("azureWorkItem")}
        />

        <Fields.Dropzone
          files={getValues("files")}
          label="Drop it like it's hot"
          disabled={formState.isSubmitting}
          register={() => register("files")}
          error={getError("files")}
          description="If you don't get a preview after you drop the image, make sure your file has an extension. Ex: my_image.png. Otherwise just use the file dialog by clicking on the drop area."
          onChange={(files) => setValue("files", files)}
        />

        <Fields.Button type="submit" disabled={formState.isSubmitting}>
          Submit
        </Fields.Button>
      </form>
    </div>
  );
};

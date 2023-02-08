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

  const { defaultUserLab } = useDefaultUserLab();

  const {
    formState,
    register,
    getValues,
    setValue,
    getFieldState,
    handleSubmit,
    watch,
    reset,
  } = useForm<FormSchema>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      lab: {
        id: defaultUserLab?.id,
        name: defaultUserLab?.displayName || defaultUserLab?.name,
      },
    },
  });

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
          register={register("title")}
        />

        <Fields.Area
          label="Description"
          description="Try to be concise in you description"
          placeholder="Issue Description"
          disabled={formState.isSubmitting}
          error={getError("description")}
          register={register("description")}
        />

        <Fields.ModalSelect
          label="Lab"
          disabled={formState.isSubmitting}
          placeholder="Ex: M2030"
          value={watch("lab")?.name}
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
          disabled={formState.isSubmitting}
          error={getError("version")}
          register={register("version")}
        />

        <Fields.Select
          label="Issue Type"
          options={["bug", "help", "feat", "cr"]}
          disabled={formState.isSubmitting}
          error={getError("type")}
          register={register("type")}
        />

        <Fields.Select
          label="Platform"
          options={["WEB", "NATIVE", "CROSS"]}
          disabled={formState.isSubmitting}
          error={getError("platform")}
          register={register("platform")}
        />

        <Fields.Area
          label="Steps To Reproduce"
          placeholder={`Ex:\n 1. Dis this; \n 2. Did that;`}
          height={140}
          disabled={formState.isSubmitting}
          error={getError("stepsToReproduce")}
          register={register("stepsToReproduce")}
        />

        <Fields.ModalSelect
          label="Component Name"
          disabled={formState.isSubmitting}
          placeholder="Ex: AccountCard"
          value={watch("component")}
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
          label="Severity"
          options={["high", "medium", "low"]}
          disabled={formState.isSubmitting}
          error={getError("severity")}
          register={register("severity")}
        />

        <Fields.Text
          label="Code Snippet"
          placeholder="https://dev.azure.com/ptbcp/IT.Ignite/_git/Project.Repo"
          disabled={formState.isSubmitting}
          error={getError("codeSnippet")}
          register={register("codeSnippet")}
        />

        <Fields.Text
          label="Specification Page"
          placeholder="https://www.figma.com/file/page.id"
          description="It's important that you insert a link to a specific frame instead of the whole page."
          disabled={formState.isSubmitting}
          error={getError("specs")}
          register={register("specs")}
        />

        <div className="flex">
          <Fields.Toggle
            label="Checked With Tech Lead"
            checked={getValues("checkTechLead")}
            onChange={(checked) => setValue("checkTechLead", checked)}
            disabled={formState.isSubmitting}
            error={getError("checkTechLead")}
            register={() => register("checkTechLead")}
          />

          <Fields.Toggle
            label="Checked With Design"
            checked={getValues("checkDesign")}
            onChange={(checked) => setValue("checkDesign", checked)}
            disabled={formState.isSubmitting}
            error={getError("checkDesign")}
            register={() => register("checkDesign")}
          />
        </div>

        <Fields.Select
          label="Scope"
          options={["dev", "design", "both"]}
          disabled={formState.isSubmitting}
          error={getError("scope")}
          register={register("scope")}
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
          onChange={(files) => setValue("files", files)}
        />

        <Fields.Button type="submit" disabled={formState.isSubmitting}>
          Submit
        </Fields.Button>
      </form>
    </div>
  );
};

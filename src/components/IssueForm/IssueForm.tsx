import { zodResolver } from "@hookform/resolvers/zod";
import { debounce } from "lodash";
import Link from "next/link";
import React from "react";
import { useForm } from "react-hook-form";
import { useDefaultUserLab } from "../../hooks/useDefaultUserLab";
import { routes } from "../../routes";
import { cn } from "../../styles/utils";
// import { useLoading } from "../../utils/GlobalState/GlobalStateProvider";
import { trpc } from "../../utils/trpc";
import { Accordion } from "../Accordion";
import { ComponentList } from "../ComponentList";
import { Expandable } from "../Expandable";
import * as Fields from "../Form/Fields";
import { IssueCard } from "../Issue/IssueCard";
import { LabList } from "../LabList";
import { ScrollView } from "../ScrollView";
import {
  type FormSchema,
  type FormSchemaKeys,
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
    // reset,
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
      setValue("lab", {
        id: defaultUserLab?.id,
        name: defaultUserLab?.displayName || defaultUserLab?.name,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultUserLab]);

  // const { setLoading } = useLoading("setOnly");

  // const resetForm = React.useCallback(() => {
  //   reset();
  //   setValue("files", []);
  //   formRef.current?.reset();
  // }, [reset, setValue]);

  const handleOnSubmit = React.useCallback(async (data: FormSchema) => {
    // setLoading(true);
    return new Promise((res) => {
      onSubmit?.(data);
      // resetForm();
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
      <RelatedIssues
        titleQuery={watch("title")}
        componentQuery={watch("component")}
      />
      <div className="h-4" />
      <form
        ref={formRef}
        className="flex flex-col"
        onSubmit={handleSubmit(handleOnSubmit)}
      >
        <Group label="Issue Info">
          <Fields.ModalSelect
            label="Component"
            disabled={formState.isSubmitting}
            placeholder="Select a component"
            value={watch("component")}
            required
            error={getError("component")}
          >
            {({ setIsOpen }) => (
              <ComponentList
                selectedComponentName={watch("component")}
                onItemPress={({ name, id }) => {
                  setValue("component", name);
                  setValue("componentId", id);
                  setIsOpen(false);
                }}
              />
            )}
          </Fields.ModalSelect>

          <Fields.Text
            label="Title"
            placeholder="Issue Title"
            description='Leave the title clean, avoiding prefixes or flags. Ex: "[bug] - Example Title" ❌ > "Example Title" ✅'
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

          <Fields.Selector
            fieldName="type"
            placeholder="Select a type"
            label="Issue Type"
            options={["bug", "help", "feat", "cr"]}
            disabled={formState.isSubmitting}
            error={getError("type")}
            required
            control={control}
            description="cr = change request"
          />

          <Fields.Area
            className="max-h-56"
            label="Steps To Reproduce"
            placeholder={`1. Been there;\n2. Done that;`}
            description="Similar to the description field but laid out as an ordered list."
            height={140}
            disabled={formState.isSubmitting}
            error={getError("stepsToReproduce")}
            required
            register={register("stepsToReproduce")}
          />

          <Fields.Text
            label="Code Snippet"
            placeholder="https://dev.azure.com/ptbcp/IT.Ignite/_git/Project.Repo"
            description="Providing a correct URL increases the chances of a quicker resolution."
            disabled={formState.isSubmitting}
            error={getError("codeSnippet")}
            required
            register={register("codeSnippet")}
          />

          <Fields.Text
            label="Specification Page"
            placeholder="https://www.figma.com/file/page.id"
            description={
              <div className="text-xs">
                <span>
                  It&apos;s important that you insert a link to a specific frame
                  instead of the whole page.{" "}
                </span>
                <span>
                  Refer to{" "}
                  <Link
                    target="_blank"
                    className="text-blue-400 underline underline-offset-4"
                    href="https://next-cf.up.railway.app/faqs/how_to_provide_a_correct_figma_spec_url"
                  >
                    this faq
                  </Link>{" "}
                  for more info.
                </span>
              </div>
            }
            disabled={formState.isSubmitting}
            error={getError("specs")}
            required
            register={register("specs")}
          />

          <Fields.Selector
            fieldName="severity"
            placeholder="Select a severity"
            label="Severity"
            options={["high", "medium", "low"]}
            disabled={formState.isSubmitting}
            error={getError("severity")}
            // required
            control={control}
          />

          {/* <Fields.Text
            label="Azure Work Item"
            placeholder="Ex: 2365789"
            disabled={formState.isSubmitting}
            error={getError("azureWorkItem")}
            register={register("azureWorkItem")}
          /> */}
        </Group>

        <Group label="Project Info">
          <Fields.ModalSelect
            label="Lab"
            disabled={formState.isSubmitting || !defaultUserLab}
            placeholder="Ex: M2030"
            value={watch("lab")?.name}
            description={
              !defaultUserLab?.id && !isLoadingDefaultUserLab ? (
                <div className="text-xs">
                  <span>
                    First, you need select your default lab in user settings.
                  </span>{" "}
                  <span>
                    Refer to{" "}
                    <Link
                      target="_blank"
                      className="text-blue-400 underline underline-offset-4"
                      href="https://next-cf.up.railway.app/faqs/select_a_default_lab"
                    >
                      this faq
                    </Link>{" "}
                    to get more info.
                  </span>
                </div>
              ) : undefined
            }
            required
            isFieldLoading={isLoadingDefaultUserLab}
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
            description="npm list @bcp-nextgen-dx-component-factory/design-system --depth=0"
            disabled={formState.isSubmitting}
            error={getError("version")}
            required
            register={register("version")}
          />

          <Fields.Selector
            fieldName="platform"
            placeholder="Select a platform"
            label="Platform"
            description="Where does your code run"
            options={["WEB", "NATIVE", "CROSS"]}
            disabled={formState.isSubmitting}
            error={getError("platform")}
            required
            control={control}
          />

          <Fields.Selector
            fieldName="scope"
            placeholder="Select a team"
            label="Who should be notified?"
            description="The team to be tagged on Discord"
            options={["dev", "design", "both"]}
            disabled={formState.isSubmitting}
            error={getError("scope")}
            required
            control={control}
          />

          {/* <div className="flex">
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
          </div> */}
        </Group>

        <Fields.Dropzone
          files={getValues("files")}
          label="Drop it like it's hot"
          disabled={formState.isSubmitting}
          register={() => register("files")}
          error={getError("files")}
          description="Drop your attachments here. If you don't get a preview after you drop the image, make sure your file has an extension. Ex: my_image.png. Otherwise just use the file dialog by clicking on the drop area."
          onChange={(files) => setValue("files", files)}
        />

        <Fields.Button type="submit" disabled={formState.isSubmitting}>
          Submit
        </Fields.Button>
      </form>
    </div>
  );
};

export type GroupProps = React.PropsWithChildren<{
  label?: string;
  className?: string;
}>;

export const Group = ({
  label,
  className,
  children,
}: GroupProps): JSX.Element => {
  return (
    <div
      className={cn(
        "relative mb-8 rounded-2xl bg-neutral-700 bg-opacity-10 p-8",
        className
      )}
    >
      {label && (
        <p className="mb-4 text-xl font-bold text-neutral-600">{label}</p>
      )}
      <div className="flex flex-col">{children}</div>
    </div>
  );
};

export type RelatedIssuesProps = {
  titleQuery: string;
  componentQuery: string;
};

export const RelatedIssues = ({
  titleQuery = "",
  componentQuery = "",
}: RelatedIssuesProps): JSX.Element => {
  const [title, setTitle] = React.useState<string>("");
  const [component, setComponent] = React.useState<string>("");

  const handleSetTitleFn = React.useMemo(
    () =>
      debounce((q: string) => {
        setTitle(q);
      }, 500),
    []
  );

  const handleSetComponentFn = React.useMemo(
    () =>
      debounce((q: string) => {
        setComponent(q);
      }, 500),
    []
  );

  React.useEffect(() => {
    handleSetTitleFn(titleQuery.length > 3 ? titleQuery : "");
  }, [handleSetTitleFn, titleQuery]);

  React.useEffect(() => {
    handleSetComponentFn(componentQuery);
  }, [handleSetComponentFn, componentQuery]);

  const { data: related } = trpc.issues.search.useQuery(
    { title, component },
    {
      enabled: Boolean(title) || Boolean(component),
    }
  );

  return (
    <Expandable expand={Boolean(related?.length)}>
      <Group
        label={related?.length ? `${related?.length} related` : undefined}
        className="mb-0"
      >
        <Accordion headerLabel={related?.length ? "Issues" : ""}>
          <div className="h-96 pt-8">
            <ScrollView className="h-full overflow-y-scroll pr-2">
              {related?.map((issue, key) => (
                <IssueCard
                  key={key}
                  className={cn(key === related.length - 1 ? "mb-0" : "")}
                  issue={issue}
                  hoverEffect={false}
                  href={routes.IssueDetail.dynamicPath(String(issue.id))}
                  hrefTarget="_blank"
                />
              ))}
            </ScrollView>
          </div>
        </Accordion>
      </Group>
    </Expandable>
  );
};

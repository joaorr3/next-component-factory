import { debounce } from "lodash";
import React from "react";
import { useForm } from "react-hook-form";
import * as Fields from "../IssueForm/Fields";

export type FiltersModel = {
  id?: string;
  title?: string;
  author?: string;
  type?: string;
};

export type IssueFiltersProps = {
  defaultValues: () => FiltersModel;
  onChange?: (props: FiltersModel) => void;
};

export const IssueFiltersComponent = ({
  defaultValues,
  onChange,
}: IssueFiltersProps): JSX.Element => {
  const { getValues, setValue, watch, register } = useForm<FiltersModel>({});

  const handleSetValue = debounce(
    (field: keyof FiltersModel, value: string) => {
      setValue(field, value);
    },
    500
  );

  React.useEffect(() => {
    const subscription = watch((filters) => {
      onChange?.(filters);
    });
    return () => subscription.unsubscribe();
  }, [onChange, watch]);

  return (
    <div>
      <p className="ml-3 mb-3">Search</p>
      <div className="flex">
        <Fields.TwTextField
          className="mr-4"
          placeholder="Issue ID"
          defaultValue={defaultValues().id}
          {...register("id")}
          value={getValues("id")}
          onChange={(e) => handleSetValue("id", e.target.value)}
        />
        <Fields.TwTextField
          className="mr-4"
          placeholder="Issue Title"
          defaultValue={defaultValues().title}
          {...register("title")}
          value={getValues("title")}
          onChange={(e) => handleSetValue("title", e.target.value)}
        />
        <Fields.TwTextField
          className="mr-4"
          placeholder="Issue Author"
          defaultValue={defaultValues().author}
          {...register("author")}
          value={getValues("author")}
          onChange={(e) => handleSetValue("author", e.target.value)}
        />

        <Fields.TwSelect
          // @ts-ignore
          defaultValue={defaultValues().type}
          {...register("type")}
        >
          <option value="">Issue Type</option>

          {["bug", "help", "feat", "cr"].map((value, key) => {
            return (
              <option key={key} value={value}>
                {value}
              </option>
            );
          })}
        </Fields.TwSelect>
      </div>
    </div>
  );
};

export const IssueFilters = React.memo(IssueFiltersComponent);

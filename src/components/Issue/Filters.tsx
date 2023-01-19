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
  onChange?: (props: FiltersModel) => void;
};

export const IssueFiltersX = ({ onChange }: IssueFiltersProps): JSX.Element => {
  const { getValues, setValue, watch, register } = useForm<FiltersModel>();

  const handleSetValue = debounce(
    (field: keyof FiltersModel, value: string) => {
      setValue(field, value);
    },
    500
  );

  React.useEffect(() => {
    const subscription = watch((value) => {
      onChange?.(value);
    });
    return () => subscription.unsubscribe();
  }, [onChange, watch]);

  return (
    <div>
      <p className="ml-3 mb-3">Search</p>
      <div className="mb-5 flex">
        <Fields.TwTextField
          className="mr-4"
          placeholder="Issue ID"
          value={getValues("id")}
          onChange={(e) => handleSetValue("id", e.target.value)}
        />
        <Fields.TwTextField
          className="mr-4"
          placeholder="Issue Title"
          value={getValues("title")}
          onChange={(e) => handleSetValue("title", e.target.value)}
        />
        <Fields.TwTextField
          className="mr-4"
          placeholder="Issue Author"
          value={getValues("author")}
          onChange={(e) => handleSetValue("author", e.target.value)}
        />

        {/* @ts-ignore */}
        <Fields.TwSelect {...register("type")}>
          <option value="" selected>
            Issue Type
          </option>

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

export const IssueFilters = React.memo(IssueFiltersX);

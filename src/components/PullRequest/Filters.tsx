import { debounce } from "lodash";
import React from "react";
import { useForm } from "react-hook-form";
import * as Fields from "../Form/Fields";
import type { PullRequestStatus } from "@prisma/client";

export type FiltersModel = {
  id?: string;
  title?: string;
  author?: string;
  status?: PullRequestStatus;
};

export type PRAuthorFilter = {
  id: number;
  friendlyName: string;
}

export type PRFiltersProps = {
  defaultValues: () => FiltersModel;
  onChange?: (props: FiltersModel) => void;
  authors: PRAuthorFilter[];
};

export const PRFiltersComponent = ({
  defaultValues,
  onChange,
  authors,
}: PRFiltersProps): JSX.Element => {
  const { getValues, setValue, watch, register, control } =
    useForm<FiltersModel>({});

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
        <Fields.TextField
          className="mr-4"
          placeholder="PR ID"
          defaultValue={defaultValues().id}
          {...register("id")}
          value={getValues("id")}
          onChange={(e) => handleSetValue("id", e.target.value)}
        />
        <Fields.TextField
          className="mr-4"
          placeholder="PR Title"
          defaultValue={defaultValues().title}
          {...register("title")}
          value={getValues("title")}
          onChange={(e) => handleSetValue("title", e.target.value)}
        />

        <Fields.Select
          toggleable
          className="mr-4"
          fieldName="author"
          placeholder="PR Author"
          options={authors?.map(author => author.friendlyName)}
          control={control}
        />

        <Fields.Select
          toggleable
          fieldName="status"
          placeholder="Type"
          options={["DRAFT", "PENDING", "PUBLISHED", "COMPLETED"]}
          control={control}
        />
      </div>
    </div>
  );
};

export const PRFilters = React.memo(PRFiltersComponent);

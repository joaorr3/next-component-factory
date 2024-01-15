import { debounce } from "lodash";
import React from "react";
import { useController, useForm } from "react-hook-form";
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

  const authorFieldController = useController({
    name: 'author',
    control,
  });

  const statusFieldController = useController({
    name: 'status',
    control,
  });

  const getUserNameById = (userId?:string) => {
    if(!userId) return 'Todos'
    return authors.find(author => author.id.toString() === userId)?.friendlyName ?? 'Todos'
  }

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

        <Fields.StructuredSelect
          toggleable
          className="mr-4"
          fieldName="author"
          placeholder="PR Author"
          selected={getUserNameById(getValues('author'))}
          onSelect={(author) => authorFieldController.field.onChange(author.id)}
          options={[undefined, ...authors].map(author => ({ id: author?.id?.toString(), value: author?.friendlyName ?? 'Todos'}))}
          control={control}
        />

        <Fields.StructuredSelect
          toggleable
          fieldName="status"
          placeholder="Type"
          selected={statusFieldController.field.value}
          onSelect={(status) => statusFieldController.field.onChange(status.id)}
          options={[undefined, "DRAFT", "PENDING", "PUBLISHED", "COMPLETED"].map(status => ({ id: status, value: status ?? 'Todos'}))}
          control={control}
        />
      </div>
    </div>
  );
};

export const PRFilters = React.memo(PRFiltersComponent);

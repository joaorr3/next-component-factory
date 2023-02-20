import { zodResolver } from "@hookform/resolvers/zod";
import type { Lab } from "@prisma/client";
import { remove } from "lodash";
import React from "react";
import { useController, useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "../styles/utils";
import type { UserStateModel } from "../utils/GlobalState/GlobalStateProvider";
import { trpc } from "../utils/trpc";
import { BackButton } from "./BackButton";
import { DataDisplay } from "./DataDisplay";
import * as Fields from "./Form/Fields";
import { InteractionElement } from "./InteractionElement";

export type UserPageProps = {
  user: UserStateModel;
  defaultUserLab: Lab | null | undefined;
  userLabs?: {
    id: string;
    name: string;
  }[];
  onSubmit: ({ labs, defaultLab }: UserFormModel) => Promise<void>;
};

export const UserPage = ({
  user,
  userLabs,
  defaultUserLab,
  onSubmit,
}: UserPageProps): JSX.Element => {
  const [showForm, setShowForm] = React.useState<boolean>(false);

  return (
    <div className="relative">
      <BackButton />

      <DataDisplay
        actionButton={{
          label: "Edit",
          isActive: showForm,
          onPress: () => {
            setShowForm(!showForm);
          },
        }}
        header={user?.profile?.friendlyName}
        data={[
          {
            label: "ID",
            value: user?.profile?.id,
          },
          {
            label: "Azure ID",
            value: user?.profile?.azureUserId,
          },
          {
            label: "Notion ID",
            value: user?.profile?.notionUserId,
          },
          {
            label: "LAB",
            value: userLabs?.map((l) => l.name).join(" / "),
            visible: !showForm,
          },
          {
            label: "Default LAB",
            value: defaultUserLab?.displayName,
            visible: !showForm,
          },
        ]}
      />

      {showForm && (
        <UserForm
          initialData={{
            labs: userLabs || [],
            defaultLab: {
              id: defaultUserLab?.id || "",
              name: defaultUserLab?.displayName || "",
            },
          }}
          onSubmit={(data) => {
            setShowForm(false);
            onSubmit(data);
          }}
        />
      )}
    </div>
  );
};

export type UserFormProps = {
  initialData: {
    labs: TempSelection[];
    defaultLab: TempSelection;
  };
  onSubmit?: (data: UserFormModel) => void;
};

const UserFormSchema = z.custom<UserFormProps["initialData"]>();

export type UserFormModel = z.infer<typeof UserFormSchema>;

type TempSelection = { id: string; name: string };

export const UserForm = ({
  initialData,
  onSubmit,
}: UserFormProps): JSX.Element => {
  const { data: labs } = trpc.labs.readMany.useQuery();

  const { formState, getFieldState, handleSubmit, reset, control } =
    useForm<UserFormModel>({
      resolver: zodResolver(UserFormSchema),
      defaultValues: initialData,
    });

  const handleOnSubmit = React.useCallback(
    async (data: UserFormModel) => {
      return new Promise((res) => {
        onSubmit?.(data);
        reset();
        res(data);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const { field: labsField } = useController({
    name: "labs",
    control,
  });

  const { field: defaultLabField } = useController({
    name: "defaultLab",
    control,
  });

  React.useEffect(() => {
    if (labsField.value.length === 0) {
      defaultLabField.onChange({
        id: "",
        name: "",
      });
    }

    const isDefaultLabFieldStillOnSelectedSubset = !!labsField.value.find(
      (l) => l.id === defaultLabField.value.id
    );

    if (!isDefaultLabFieldStillOnSelectedSubset) {
      defaultLabField.onChange({
        id: "",
        name: "",
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [labsField.value]);

  const handleOnPress = React.useCallback(
    ({ id, name }: TempSelection) => {
      const lab = { id, name };
      const copy = [...labsField.value];
      const has = !!copy.find((item) => item.id === id);

      if (has) {
        remove(copy, (item) => item.id === id);
      } else {
        copy.push(lab);
      }

      labsField.onChange(copy);
    },
    [labsField]
  );

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(handleOnSubmit)}>
      <Fields.ModalSelect
        label="Lab"
        placeholder="Ex: M2030"
        value={labsField.value.map((l) => l.name).join(" / ")}
        error={getFieldState("labs").error}
      >
        {({ setIsOpen }) => (
          <div className="m-0 flex h-full flex-col p-5">
            <div className="mb-5 flex-1 rounded-2xl bg-neutral-100 p-5 dark:bg-neutral-900 dark:bg-opacity-50">
              <div className="flex flex-wrap">
                {labs?.map((lab) => {
                  const selected = !!labsField.value.find(
                    (item) => item.id === lab.id
                  );
                  return (
                    <div
                      key={lab.id}
                      onClick={() => {
                        handleOnPress({
                          id: lab.id,
                          name: lab.displayName || lab.name,
                        });
                      }}
                      className={cn(
                        "flex select-none items-center justify-center",
                        "mb-3 mr-3 max-w-max grow-0 cursor-pointer rounded-2xl bg-neutral-200 p-3 font-bold dark:bg-neutral-700 dark:outline-neutral-200",
                        selected ? "outline" : ""
                      )}
                    >
                      {lab.displayName}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end">
              <InteractionElement
                text="OK"
                onPress={() => {
                  setIsOpen(false);
                }}
              />
            </div>
          </div>
        )}
      </Fields.ModalSelect>

      <Fields.ModalSelect
        label="Default Lab"
        disabled={labsField.value?.length === 0}
        placeholder="Default lab"
        value={defaultLabField.value.name}
        error={getFieldState("defaultLab")?.error}
      >
        {({ setIsOpen }) => (
          <div className="m-0 flex h-full flex-col p-5">
            <div className="mb-5 flex-1 rounded-2xl bg-neutral-100 p-5 dark:bg-neutral-900 dark:bg-opacity-50">
              <div className="flex flex-wrap">
                {labsField.value?.map((lab) => {
                  const selected = lab.id === defaultLabField.value.id;
                  return (
                    <div
                      key={lab.id}
                      onClick={() => {
                        defaultLabField.onChange(lab);
                      }}
                      className={cn(
                        "flex select-none items-center justify-center",
                        "mb-3 mr-3 max-w-max grow-0 cursor-pointer rounded-2xl bg-neutral-200 p-3 font-bold dark:bg-neutral-700 dark:outline-neutral-200",
                        selected ? "outline" : ""
                      )}
                    >
                      {lab.name}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end">
              <InteractionElement
                text="OK"
                onPress={() => {
                  setIsOpen(false);
                }}
              />
            </div>
          </div>
        )}
      </Fields.ModalSelect>

      {formState.isDirty && (
        <div className="flex justify-end">
          <Fields.Button type="submit">Update</Fields.Button>
        </div>
      )}
    </form>
  );
};

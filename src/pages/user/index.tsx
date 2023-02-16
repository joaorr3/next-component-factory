import { zodResolver } from "@hookform/resolvers/zod";
import { remove } from "lodash";
import Head from "next/head";
import React from "react";
import { useController, useForm } from "react-hook-form";
import { z } from "zod";
import { BackButton } from "../../components/BackButton";
import { DataDisplay } from "../../components/DataDisplay";
import * as Fields from "../../components/Form/Fields";
import { InteractionElement } from "../../components/InteractionElement";
import { derive } from "../../shared/utils";
import { cn } from "../../styles/utils";
import {
  useGlobalState,
  useLoading,
} from "../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../utils/hoc";
import { trpc } from "../../utils/trpc";

export default withRoles("User", () => {
  const [showForm, setShowForm] = React.useState<boolean>(false);

  const {
    state: { user },
    actions: { setDefaultUserLab },
  } = useGlobalState();

  const {
    data: defaultUserLab,
    isLoading: isLoadingDefaultUserLab,
    fetchStatus: defaultUserLabFetchStatus,
    refetch: refetchDefaultUserLab,
  } = trpc.labs.read.useQuery({
    id: user.profile?.defaultLabId || undefined,
  });

  const {
    data: userLabs,
    isLoading: isLoadingUserLabs,
    fetchStatus: userLabsFetchStatus,
    refetch: refetchUserLabs,
  } = trpc.user.userLabs.useQuery();

  const isLoading = derive(() => {
    return (
      isLoadingDefaultUserLab &&
      defaultUserLabFetchStatus !== "idle" &&
      isLoadingUserLabs &&
      userLabsFetchStatus !== "idle"
    );
  });

  const { setLoading } = useLoading(isLoading);

  const { mutateAsync: updateDefaultUserLab } =
    trpc.user.updateDefaultUserLab.useMutation();

  const { mutateAsync: updateUserLabs } =
    trpc.user.updateUserLabs.useMutation();

  const { mutateAsync: deleteUserLabs } =
    trpc.user.deleteUserLabs.useMutation();

  const onSubmit = React.useCallback(
    async ({ labs, defaultLab }: UserFormModel) => {
      setLoading(true);

      await deleteUserLabs();
      await updateUserLabs({
        labs: labs.map((l) => l.id),
      });

      const nextDefaultLabId = derive(() => {
        const isDefaultLabStillValid = !!labs.find(
          ({ id }) => id === defaultUserLab?.id
        );

        if (isDefaultLabStillValid) {
          return defaultLab.id;
        } else {
          return labs[0]?.id || null;
        }
      });

      await updateDefaultUserLab({ defaultLabId: nextDefaultLabId });

      setDefaultUserLab(nextDefaultLabId);

      await refetchUserLabs();
      await refetchDefaultUserLab();

      setShowForm(false);
      setLoading(false);
    },
    [
      setLoading,
      deleteUserLabs,
      updateUserLabs,
      updateDefaultUserLab,
      setDefaultUserLab,
      refetchUserLabs,
      refetchDefaultUserLab,
      defaultUserLab?.id,
    ]
  );

  return (
    <React.Fragment>
      <Head>
        <title>User {user?.profile?.friendlyName}</title>
      </Head>

      <main>
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
              onSubmit={onSubmit}
            />
          )}
        </div>
      </main>
    </React.Fragment>
  );
});

// export default UserDetail;

export type UserFormProps = {
  initialData: {
    labs: TempSelection[];
    defaultLab: TempSelection;
  };
  onSubmit?: (data: UserFormModel) => void;
};

const UserFormSchema = z.custom<UserFormProps["initialData"]>();

type UserFormModel = z.infer<typeof UserFormSchema>;

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

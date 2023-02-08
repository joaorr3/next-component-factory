import { zodResolver } from "@hookform/resolvers/zod";
import { remove } from "lodash";
import Head from "next/head";
import React from "react";
import { useForm } from "react-hook-form";
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

  const { setLoading } = useLoading();

  const { data: defaultUserLab, refetch: refetchDefaultUserLab } =
    trpc.labs.read.useQuery({
      id: user.profile?.defaultLabId || undefined,
    });

  const { data: userLabs, refetch } = trpc.user.userLabs.useQuery();

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
          return labs[0].id;
        }
      });

      await updateDefaultUserLab({ defaultLabId: nextDefaultLabId });

      setDefaultUserLab(nextDefaultLabId);

      await refetch();
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
      refetch,
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

  const { formState, getFieldState, handleSubmit, reset, setValue, watch } =
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

  const selectedLabs = watch("labs");
  const selectedDefaultLab = watch("defaultLab");

  const handleOnPress = React.useCallback(
    ({ id, name }: TempSelection) => {
      const lab = { id, name };
      const copy = [...selectedLabs];
      const has = !!copy.find((item) => item.id === id);

      if (has) {
        remove(copy, (item) => item.id === id);
      } else {
        copy.push(lab);
      }

      setValue("labs", copy);
    },
    [selectedLabs, setValue]
  );

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(handleOnSubmit)}>
      <Fields.ModalSelect
        label="Lab"
        disabled={formState.isSubmitting}
        placeholder="Ex: M2030"
        value={watch("labs")
          .map((l) => l.name)
          .join(" / ")}
        error={getFieldState("labs").error}
      >
        {({ setIsOpen }) => (
          <div className="m-0 p-5">
            <div className="mb-5 rounded-2xl bg-neutral-900 bg-opacity-50 p-5">
              <div className="flex flex-wrap">
                {labs?.map((lab) => {
                  const selected = !!selectedLabs.find(
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
                        "mb-3 mr-3 max-w-max grow-0 cursor-pointer rounded-2xl bg-neutral-600 bg-opacity-40 p-3 font-bold outline-neutral-200 hover:bg-opacity-50",
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
        disabled={formState.isSubmitting}
        placeholder="Default lab"
        value={watch("defaultLab")?.name}
        error={getFieldState("defaultLab")?.error}
      >
        {({ setIsOpen }) => (
          <div className="m-0 p-5">
            <div className="mb-5 rounded-2xl bg-neutral-900 bg-opacity-50 p-5">
              <div className="flex flex-wrap">
                {initialData.labs?.map((lab) => {
                  const selected = lab.id === selectedDefaultLab.id;
                  return (
                    <div
                      key={lab.id}
                      onClick={() => {
                        setValue("defaultLab", lab);
                      }}
                      className={cn(
                        "flex select-none items-center justify-center",
                        "mb-3 mr-3 max-w-max grow-0 cursor-pointer rounded-2xl bg-neutral-600 bg-opacity-40 p-3 font-bold outline-neutral-200 hover:bg-opacity-50",
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

      <div className="flex justify-end">
        <Fields.Button type="submit" disabled={formState.isSubmitting}>
          Update
        </Fields.Button>
      </div>
    </form>
  );
};

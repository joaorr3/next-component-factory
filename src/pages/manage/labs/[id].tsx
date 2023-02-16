import { zodResolver } from "@hookform/resolvers/zod";
import type { Lab } from "@prisma/client";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BackButton } from "../../../components/BackButton";
import { DataDisplay } from "../../../components/DataDisplay";
import * as Fields from "../../../components/Form/Fields";
import { ListItem } from "../../../components/ListItem";
import Modal from "../../../components/Modal";
import { useLoading } from "../../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../../utils/hoc";
import { trpc } from "../../../utils/trpc";

export default withRoles("ManageLabsDetail", () => {
  const router = useRouter();
  const { id } = router.query;

  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const {
    data: lab,
    isLoading,
    fetchStatus,
    refetch,
  } = trpc.labs.read.useQuery({
    id: typeof id === "string" ? id : undefined,
  });

  const { data: labMembers } = trpc.labs.allLabMembers.useQuery({
    id: lab?.id,
  });

  const { mutateAsync: updateLab } = trpc.labs.update.useMutation();

  const { setLoading } = useLoading(isLoading && fetchStatus !== "idle");

  const onSubmit = React.useCallback(
    async ({ id, ...data }: LabFormModel) => {
      setIsOpen(false);
      setLoading(true);

      if (id) {
        await updateLab({
          id,
          lab: data,
        });
      }

      refetch();
      setLoading(false);
    },
    [refetch, setLoading, updateLab]
  );

  return (
    <React.Fragment>
      <Head>
        <title>LAB: {lab?.name}</title>
      </Head>

      <main>
        <div className="relative">
          <BackButton />

          <DataDisplay
            actionButton={{
              label: "Edit",
              onPress: () => {
                setIsOpen(true);
              },
            }}
            header={lab?.displayName || lab?.name}
            data={[
              {
                label: "ID",
                value: lab?.id,
              },
              {
                label: "Name",
                value: lab?.name,
              },
              {
                label: "Channel ID",
                value: lab?.channelId,
              },
              {
                label: "Channel Name",
                value: lab?.channelName,
              },
              {
                label: "Guild Role ID",
                value: lab?.guildRoleId,
              },
            ]}
          />

          <div>
            {labMembers?.map((member) => {
              return (
                <ListItem
                  key={member.id}
                  title={member.friendlyName || member.username}
                  headerLabel={`${member.id} / Default Lab ID: ${
                    member.defaultLabId || "--"
                  }`}
                  startImageUrl={member.avatarURL}
                />
              );
            })}
          </div>
        </div>
      </main>

      {lab && (
        <Modal
          isOpen={isOpen}
          onChange={(status) => {
            setIsOpen(status);
          }}
        >
          <div className="h-full rounded-2xl p-5 dark:bg-neutral-800">
            <LabForm onSubmit={onSubmit} initialData={lab} />
          </div>
        </Modal>
      )}
    </React.Fragment>
  );
});

export type LabFormProps = {
  initialData: Lab;
  onSubmit?: (data: LabFormModel) => void;
};

const LabFormSchema = z.custom<Lab>();

type LabFormModel = z.infer<typeof LabFormSchema>;

export const LabForm = ({
  initialData,
  onSubmit,
}: LabFormProps): JSX.Element => {
  const { formState, getFieldState, handleSubmit, reset, register } =
    useForm<LabFormModel>({
      resolver: zodResolver(LabFormSchema),
      defaultValues: initialData,
    });

  const handleOnSubmit = React.useCallback(
    async (data: LabFormModel) => {
      return new Promise((res) => {
        onSubmit?.(data);
        reset();
        res(data);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <form
      className="flex h-full flex-col"
      onSubmit={handleSubmit(handleOnSubmit)}
    >
      <Fields.Text
        label="Lab Display Name"
        disabled={formState.isSubmitting}
        error={getFieldState("displayName").error}
        register={register("displayName")}
      />

      {initialData && (
        <DataDisplay
          className="flex-grow-[2]"
          data={[
            {
              label: "ID",
              value: initialData.id,
            },
            {
              label: "Name",
              value: initialData.name,
            },
            {
              label: "Channel ID",
              value: initialData.channelId,
            },
            {
              label: "Channel Name",
              value: initialData.channelName,
            },
            {
              label: "Guild Role ID",
              value: initialData.guildRoleId,
            },
          ]}
        />
      )}

      <div className="flex justify-end">
        <Fields.Button type="submit" disabled={formState.isSubmitting}>
          Update
        </Fields.Button>
      </div>
    </form>
  );
};

import { zodResolver } from "@hookform/resolvers/zod";
import type { Lab } from "@prisma/client";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Accordion } from "../../../components/Accordion";
import { BackButton } from "../../../components/BackButton";
import { DataDisplay } from "../../../components/DataDisplay";
import * as Fields from "../../../components/Form/Fields";
import { ListItemExpanded } from "../../../components/ListItem";
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
  } = trpc.labs.labWithMembers.useQuery({
    id: typeof id === "string" ? id : undefined,
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

  if (!lab) {
    return <React.Fragment />;
  }

  const { LabGuildUser: _, GuildRole: __, ...formInitialData } = lab;

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
                label: "Channel ID",
                value: lab?.channelId,
              },
              {
                label: "Guild Channel Name",
                value: lab?.channelName,
              },
              {
                label: "Guild Role ID",
                value: lab?.guildRoleId,
              },
              {
                label: "Guild Role Name",
                value: lab?.GuildRole?.name,
              },
            ]}
          />

          <Accordion
            headerLabel="Members"
            className="mb-4 border-b border-solid border-b-neutral-800 pb-4"
          >
            <div className="pt-8">
              {lab?.LabGuildUser?.map(({ GuildUser: member }) => {
                return (
                  <ListItemExpanded
                    key={member.id}
                    title={member.friendlyName || member.username}
                    startImageUrl={member.avatarURL}
                    AdditionalInfoElement={() => {
                      return (
                        <div className="pt-4">
                          <DataDisplay
                            nude
                            header="Guild"
                            data={[
                              {
                                label: "ID",
                                value: member.id,
                              },
                              {
                                label: "Username",
                                value: member.username,
                              },
                              {
                                label: "Azure ID",
                                value: member.azureUserId,
                              },
                            ]}
                          />

                          {member.User && (
                            <DataDisplay
                              nude
                              className="pt-3"
                              header="Account"
                              data={[
                                {
                                  label: "ID",
                                  value: member.User?.id,
                                },
                                {
                                  label: "Email",
                                  value: member.User?.email,
                                },
                              ]}
                            />
                          )}
                        </div>
                      );
                    }}
                  />
                );
              })}
            </div>
          </Accordion>
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
            <LabForm onSubmit={onSubmit} initialData={formInitialData} />
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

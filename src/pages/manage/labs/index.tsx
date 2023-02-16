import { zodResolver } from "@hookform/resolvers/zod";
import type { Lab } from "@prisma/client";
import Head from "next/head";
import Router from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BackButton } from "../../../components/BackButton";
import * as Fields from "../../../components/Form/Fields";
import { InteractionElement } from "../../../components/InteractionElement";
import { ListItem } from "../../../components/ListItem";
import Modal from "../../../components/Modal";
import { routes } from "../../../routes";
import { useLoading } from "../../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../../utils/hoc";
import { trpc } from "../../../utils/trpc";

export default withRoles("ManageLabs", () => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  const [selectedLab, setSelectedLab] = React.useState<Lab | undefined>(
    undefined
  );

  const { data, isLoading, fetchStatus, refetch } =
    trpc.labs.readMany.useQuery();
  const { mutateAsync: createLab } = trpc.labs.create.useMutation();

  const { setLoading } = useLoading(isLoading && fetchStatus !== "idle");

  const handleOnPress = (id: string) => {
    Router.push(routes.ManageLabsDetail.dynamicPath(id));
  };

  const onSubmit = React.useCallback(
    async (createLabData: LabFormModel) => {
      setIsOpen(false);
      setLoading(true);

      await createLab({
        lab: createLabData,
      });

      refetch();
      setLoading(false);
      setSelectedLab(undefined);
    },
    [createLab, refetch, setLoading]
  );

  return (
    <React.Fragment>
      <Head>
        <title>Manage / Labs</title>
      </Head>

      <React.Fragment>
        <main>
          <BackButton />

          <p className="m-3 mb-8 mt-12 text-xl font-bold">Labs</p>

          <div className="relative">
            <div className="absolute right-0 -top-14">
              <InteractionElement
                text="Add"
                onPress={() => {
                  setIsOpen(true);
                  setSelectedLab(undefined);
                }}
              />
            </div>

            <div className="flex flex-col">
              {data?.map(({ id, name, displayName }, index) => {
                return (
                  <ListItem
                    key={index}
                    title={displayName || name}
                    onPress={() => handleOnPress(id)}
                  />
                );
              })}
            </div>
          </div>
        </main>

        <Modal
          isOpen={isOpen}
          onChange={(status) => {
            setIsOpen(status);
            if (!status) {
              setSelectedLab(undefined);
            }
          }}
        >
          <div className="h-full rounded-2xl p-5 dark:bg-neutral-800">
            <LabForm onSubmit={onSubmit} initialData={selectedLab} />
          </div>
        </Modal>
      </React.Fragment>
    </React.Fragment>
  );
});

export type LabFormProps = {
  initialData?: Lab;
  onSubmit?: (data: LabFormModel) => void;
  onDelete?: (id: string) => void;
};

const LabFormSchema = z.custom<Pick<Lab, "displayName">>();

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

      <p className="flex-grow-[2] text-sm">
        This action will trigger some procedures: <br />
        - Discord: Create Role;
        <br />
        - DB: Persist Role;
        <br />
        - Discord: Create Channel;
        <br />
        - DB: Save Lab record;
        <br />
      </p>

      <div className="flex flex-1 justify-end">
        <Fields.Button type="submit" disabled={formState.isSubmitting}>
          Submit
        </Fields.Button>
      </div>
    </form>
  );
};

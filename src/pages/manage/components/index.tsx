import { zodResolver } from "@hookform/resolvers/zod";
import { type Component } from "@prisma/client";
import Head from "next/head";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ComponentList,
  type ComponentListRef,
} from "../../../components/ComponentList";
import { InteractionElement } from "../../../components/InteractionElement";
import * as Fields from "../../../components/Form/Fields";
import Modal from "../../../components/Modal";
import { useLoading } from "../../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../../utils/hoc";
import { trpc } from "../../../utils/trpc";
import { notEmptyString } from "../../../utils/validators";

export default withRoles("ManageComponents", () => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [selectedComponent, setSelectedComponent] = React.useState<
    Component | undefined
  >(undefined);

  const componentListRef = React.useRef<ComponentListRef>(null);

  const { mutateAsync: create } = trpc.components.create.useMutation();
  const { mutateAsync: update } = trpc.components.update.useMutation();

  const { setLoading } = useLoading("setOnly");

  const onSubmit = React.useCallback(
    async ({ id, ...data }: ComponentFormModel) => {
      setIsOpen(false);
      setLoading(true);

      if (id) {
        await update({
          id,
          componentData: data,
        });
      } else {
        await create({
          componentData: data,
        });
      }

      componentListRef.current?.refetch();
      setLoading(false);
      setSelectedComponent(undefined);
    },
    [create, setLoading, update]
  );

  return (
    <React.Fragment>
      <Head>
        <title>Manage / Components</title>
      </Head>
      <main>
        <p className="m-3 mb-8 text-xl font-bold">Components</p>

        <div
          className="relative rounded-2xl bg-neutral-100 dark:bg-neutral-800"
          style={{ height: "70vh" }}
        >
          <div className="absolute right-0 -top-16">
            <InteractionElement
              text="Add"
              onPress={() => {
                setIsOpen(true);
                setSelectedComponent(undefined);
              }}
            />
          </div>

          <ComponentList
            ref={componentListRef}
            selectedComponentName={selectedComponent?.name}
            onItemPress={(component) => {
              setSelectedComponent(component);
              setIsOpen(true);
            }}
          />
        </div>

        <Modal
          isOpen={isOpen}
          onChange={(status) => {
            setIsOpen(status);
            if (!status) {
              setSelectedComponent(undefined);
            }
          }}
        >
          <div className="h-full rounded-2xl p-5 dark:bg-neutral-800">
            <ComponentForm
              onSubmit={onSubmit}
              initialData={selectedComponent}
            />
          </div>
        </Modal>
      </main>
    </React.Fragment>
  );
});

export type ComponentFormProps = {
  initialData?: ComponentFormModel;
  onSubmit?: (data: ComponentFormModel) => void;
};

const componentFormSchema = z.object({
  id: z.string().optional(),
  name: notEmptyString,
  category: z.enum(["ATOMS", "BASE", "MOLECULES", "ORGANISMS"]),
  description: z.string().nullable(),
});

type ComponentFormModel = z.infer<typeof componentFormSchema>;

export const ComponentForm = ({
  initialData,
  onSubmit,
}: ComponentFormProps): JSX.Element => {
  const { mutateAsync: deleteComponent } = trpc.components.delete.useMutation();

  const { formState, getFieldState, handleSubmit, reset, register, control } =
    useForm<ComponentFormModel>({
      resolver: zodResolver(componentFormSchema),
      defaultValues: initialData,
    });

  const { setLoading } = useLoading("setOnly");

  const handleOnSubmit = React.useCallback(
    async (data: ComponentFormModel) => {
      return new Promise((res) => {
        onSubmit?.(data);
        reset();
        res(data);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleDelete = React.useCallback(
    async (id?: string) => {
      if (id) {
        setLoading(true);
        await deleteComponent({ id });
        setLoading(false);
      }
    },
    [deleteComponent, setLoading]
  );

  return (
    <form
      className="flex h-full flex-col"
      onSubmit={handleSubmit(handleOnSubmit)}
    >
      <Fields.Text
        label="Component Name"
        placeholder="Ex: AccountCard"
        disabled={formState.isSubmitting}
        error={getFieldState("name").error}
        register={register("name")}
      />

      <Fields.Select
        label="Category"
        fieldName="category"
        options={["BASE", "ATOMS", "MOLECULES", "ORGANISMS"]}
        disabled={formState.isSubmitting}
        error={getFieldState("category").error}
        control={control}
      />

      <Fields.Area
        label="Component Description"
        disabled={formState.isSubmitting}
        error={getFieldState("description").error}
        register={register("description")}
      />

      <div className="flex flex-1 justify-end">
        {initialData?.id && (
          <Fields.Button
            className="mr-3 bg-red-600 hover:bg-red-700 focus:ring-red-500"
            disabled={formState.isSubmitting}
            onClick={() => handleDelete(initialData.id)}
          >
            Delete
          </Fields.Button>
        )}

        <Fields.Button type="submit" disabled={formState.isSubmitting}>
          Submit
        </Fields.Button>
      </div>
    </form>
  );
};

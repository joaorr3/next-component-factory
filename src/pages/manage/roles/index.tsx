import type { GuildRole, Lab } from "@prisma/client";
import { debounce, sortBy } from "lodash";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import { useController, useForm } from "react-hook-form";
import { Accordion } from "../../../components/Accordion";
import { BackButton } from "../../../components/BackButton";
import { DataDisplay } from "../../../components/DataDisplay";
import * as Fields from "../../../components/Form/Fields";
import { EditIcon } from "../../../components/Icons/EditIcon";
import { ListItemExpanded } from "../../../components/ListItem";
import { routes } from "../../../routes";
import { cn } from "../../../styles/utils";
import { useLoading } from "../../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../../utils/hoc";
import { trpc } from "../../../utils/trpc";

export default withRoles("ManageRoles", () => {
  return (
    <React.Fragment>
      <Head>
        <title>Manage / Users</title>
      </Head>

      <main>
        <BackButton />

        <GuildRoles />
      </main>
    </React.Fragment>
  );
});

const GuildRoles = React.memo(() => {
  const {
    data: guildRoles,
    isLoading: isLoadingGuildRoles,
    refetch,
  } = trpc.roles.all.useQuery();

  const { setValue, watch, control } = useForm<{
    query: string;
    queryIsAutoAssignable: string | undefined;
  }>({
    defaultValues: {
      query: "",
      queryIsAutoAssignable: undefined,
    },
  });

  const query = watch("query");
  const queryIsAutoAssignable = watch("queryIsAutoAssignable");

  const results = React.useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    if (query === "" && queryIsAutoAssignable === undefined) {
      return guildRoles;
    }

    const filtered = guildRoles
      ?.filter(({ name }) => {
        const nRoleName = name.normalize("NFD").replace(/\p{Diacritic}/gu, "");

        return nRoleName.toLowerCase().includes(normalizedQuery);
      })
      .filter(({ isAutoAssignable }) => {
        if (queryIsAutoAssignable === "yes") {
          return isAutoAssignable;
        } else if (queryIsAutoAssignable === "no") {
          return !isAutoAssignable;
        }

        return true;
      });

    return sortBy(filtered, (v) => {
      const nUserName = v.name?.normalize("NFD").replace(/\p{Diacritic}/gu, "");
      return !nUserName?.toLowerCase()?.startsWith(normalizedQuery);
    });
  }, [guildRoles, query, queryIsAutoAssignable]);

  useLoading(isLoadingGuildRoles);

  const handleSetQuery = debounce((value: string) => {
    setValue("query", value);
  }, 800);

  const refetchGuildUsers = async () => {
    await refetch();
  };

  return (
    <Accordion
      headerLabel="Guild Roles"
      className="mb-4 border-b border-solid border-b-neutral-800 pb-4"
    >
      <div className="mx-1 flex pt-8">
        <Fields.TextField
          className="mr-4"
          placeholder="Search Role"
          onChange={(e) => handleSetQuery(e.target.value)}
        />
        <Fields.Select
          toggleable
          description="Is Auto Assignable?"
          fieldName="queryIsAutoAssignable"
          placeholder="--"
          options={["yes", "no"]}
          control={control}
        />
      </div>

      <div className="text mb-3 ml-3 grow pt-3 text-xs opacity-50">
        {results?.length} results
      </div>

      <div>
        {results?.map((role) => {
          return (
            <ListItemExpanded
              key={role.id}
              title={role.name}
              headerLabel={role.lab ? "Lab" : ""}
              AdditionalInfoElement={() => {
                return (
                  <GuildRoleAdditionalInfoElement
                    role={role}
                    refetch={refetchGuildUsers}
                  />
                );
              }}
            />
          );
        })}
      </div>
    </Accordion>
  );
});

type GuildRoleAdditionalInfoElementProps = {
  role: GuildRole & {
    lab: Lab | null;
  };
  refetch: () => Promise<void>;
};

const GuildRoleAdditionalInfoElement = React.memo(
  ({ role, refetch }: GuildRoleAdditionalInfoElementProps): JSX.Element => {
    const [showForm, setShowForm] = React.useState<boolean>(false);

    const { formState, handleSubmit, control } = useForm<{
      isAutoAssignable: boolean;
    }>({
      defaultValues: {
        isAutoAssignable: role.isAutoAssignable,
      },
    });

    const { field: isAutoAssignableField } = useController({
      name: "isAutoAssignable",
      control,
    });

    const { setLoading } = useLoading("setOnly");

    const { mutateAsync: updateRole } = trpc.roles.updateRole.useMutation();

    const onSubmit = React.useCallback(
      async ({ isAutoAssignable }: { isAutoAssignable: boolean }) => {
        setLoading(true);

        await updateRole({
          id: role.id,
          isAutoAssignable,
        });

        await refetch();

        setLoading(false);
        setShowForm(false);
      },
      [setLoading, updateRole, role.id, refetch]
    );

    return (
      <div className="pt-4">
        <DataDisplay
          nude
          header="Info"
          data={[
            {
              label: "ID",
              value: role.id,
            },
            {
              label: "Name",
              value: role.name,
            },
            {
              label: "Is Auto Assignable",
              value: role.isAutoAssignable ? "Yes" : "No",
            },
            {
              label: "Lab",
              visible: !!role.lab,
              element: (
                <Link
                  className="text-sm font-bold text-blue-400 underline underline-offset-4"
                  href={routes.ManageLabsDetail.dynamicPath(role.lab?.id)}
                >
                  {role.lab?.displayName}
                </Link>
              ),
            },
          ]}
        />

        <div className="flex items-center py-3">
          <p className="mr-1 text-xl font-bold">Edit Role</p>

          <div
            className={cn(
              "cursor-pointer rounded-lg bg-opacity-20 p-1",
              showForm ? "bg-neutral-400" : ""
            )}
            onClick={() => setShowForm(!showForm)}
          >
            <EditIcon />
          </div>
        </div>

        {showForm && (
          <div className="mx-1 rounded-xl bg-neutral-200 p-3 dark:bg-neutral-700">
            <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
              <Fields.Toggle
                label="Is Auto Assignable?"
                checked={isAutoAssignableField.value}
                onChange={(checked) => isAutoAssignableField.onChange(checked)}
                register={() => true}
              />

              {formState.isDirty && (
                <div className="flex justify-end">
                  <Fields.Button type="submit">Update</Fields.Button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    );
  }
);

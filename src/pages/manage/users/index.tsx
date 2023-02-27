import { debounce, sortBy } from "lodash";
import Head from "next/head";
import React from "react";
import { useForm } from "react-hook-form";
import { Accordion } from "../../../components/Accordion";
import { BackButton } from "../../../components/BackButton";
import { DataDisplay } from "../../../components/DataDisplay";
import * as Fields from "../../../components/Form/Fields";
import { Button } from "../../../components/Form/Fields";
import { ListItemExpanded } from "../../../components/ListItem";
import { GuildUserAdditionalInfoElement } from "../../../components/UserPage";
import { useLoading } from "../../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../../utils/hoc";
import { trpc } from "../../../utils/trpc";

export default withRoles("ManageUsers", () => {
  const { data: users } = trpc.user.labUsersWithoutProjectRole.useQuery();
  const { mutateAsync: notify, isLoading } =
    trpc.user.notifyLabUsersWithoutProjectRole.useMutation();

  useLoading(isLoading);

  const handleNotify = async () => {
    if (users) {
      await notify({ users });
    }
  };

  return (
    <React.Fragment>
      <Head>
        <title>Manage / Users</title>
      </Head>

      <main>
        <BackButton />

        <GuildUsers />

        <Accordion
          headerLabel="Users lacking a project role"
          className="mb-4 border-b border-solid border-b-neutral-800 pb-4"
        >
          <DataDisplay
            className="pt-8"
            data={users?.map(({ username }) => ({
              label: "User",
              value: username,
            }))}
          />

          <div className="flex justify-end">
            <Button onClick={handleNotify}>Notify</Button>
          </div>
        </Accordion>
      </main>
    </React.Fragment>
  );
});

const GuildUsers = React.memo(() => {
  const {
    data: guildUsers,
    isLoading: isLoadingGuildUsers,
    refetch,
  } = trpc.user.allGuildUsers.useQuery();

  const { setValue, watch, control } = useForm<{
    query: string;
    queryIsRegistered: string | undefined;
  }>({
    defaultValues: {
      query: "",
      queryIsRegistered: undefined,
    },
  });

  const query = watch("query");
  const queryIsRegistered = watch("queryIsRegistered");

  const results = React.useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();

    if (query === "" && queryIsRegistered === undefined) {
      return guildUsers;
    }

    const filtered = guildUsers
      ?.filter(({ username, friendlyName, LabGuildUser }) => {
        const nUserName = username
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "");

        const nFriendlyName = friendlyName
          ?.normalize("NFD")
          .replace(/\p{Diacritic}/gu, "");

        const foundLabs = LabGuildUser.find(({ Lab: { displayName } }) => {
          const nLabDisplayName = displayName
            ?.normalize("NFD")
            .replace(/\p{Diacritic}/gu, "");
          return nLabDisplayName?.toLowerCase().includes(normalizedQuery);
        });

        return (
          nUserName.toLowerCase().includes(normalizedQuery) ||
          nFriendlyName?.toLowerCase().includes(normalizedQuery) ||
          !!foundLabs
        );
      })
      .filter(({ User }) => {
        if (queryIsRegistered === "yes") {
          return !!User;
        } else if (queryIsRegistered === "no") {
          return !User;
        }

        return true;
      });

    return sortBy(filtered, (v) => {
      const nUserName = (v.friendlyName || v.username)
        ?.normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");
      return !nUserName?.toLowerCase()?.startsWith(normalizedQuery);
    });
  }, [guildUsers, query, queryIsRegistered]);

  useLoading(isLoadingGuildUsers);

  const handleSetQuery = debounce((value: string) => {
    setValue("query", value);
  }, 800);

  const refetchGuildUsers = async () => {
    await refetch();
  };

  return (
    <Accordion
      headerLabel="Guild Users"
      className="mb-4 border-b border-solid border-b-neutral-800 pb-4"
    >
      <div className="mx-1 flex pt-8">
        <Fields.TextField
          className="mr-4"
          placeholder="Search User Name / LAB"
          onChange={(e) => handleSetQuery(e.target.value)}
        />
        <Fields.Select
          toggleable
          description="Is registered?"
          fieldName="queryIsRegistered"
          placeholder="Registered"
          options={["yes", "no"]}
          control={control}
        />
      </div>

      <div className="text mb-3 ml-3 grow pt-3 text-xs opacity-50">
        {results?.length} results
      </div>

      <div>
        {results?.map((member) => {
          const isRegistered = member.User ? "[Registered]" : "";
          const needsDefaultLab = !member.defaultLabId
            ? "[Needs Default Lab]"
            : "";

          return (
            <ListItemExpanded
              key={member.id}
              title={member.friendlyName || member.username}
              startImageUrl={member.avatarURL}
              headerLabel={`${isRegistered} ${needsDefaultLab}`.trim()}
              AdditionalInfoElement={() => {
                return (
                  <GuildUserAdditionalInfoElement
                    member={member}
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

import Head from "next/head";
import React from "react";
import { BackButton } from "../../../components/BackButton";
import { DataDisplay } from "../../../components/DataDisplay";
import { Button } from "../../../components/Form/Fields";
import { ListItemExpanded } from "../../../components/ListItem";
import { rolesParser } from "../../../shared/roles";
import { useLoading } from "../../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../../utils/hoc";
import { trpc } from "../../../utils/trpc";

export default withRoles("ManageUsers", () => {
  const { data: users } = trpc.user.labUsersWithoutProjectRole.useQuery();
  const { mutateAsync: notify, isLoading } =
    trpc.user.notifyLabUsersWithoutProjectRole.useMutation();

  const { data: guildUsers, isLoading: isLoadingGuildUsers } =
    trpc.user.allGuildUsers.useQuery();

  useLoading(isLoading || isLoadingGuildUsers);

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
        <div className="relative mb-24">
          <BackButton />

          <DataDisplay
            header="Users lacking a project role"
            data={users?.map(({ username }) => ({
              label: "User",
              value: username,
            }))}
          />

          <div className="flex justify-end">
            <Button onClick={handleNotify}>Notify</Button>
          </div>
        </div>

        <div>
          <p className="mb-4 ml-3 text-2xl font-bold">Guild Users</p>

          <div className="text mb-3 ml-3 grow text-xs opacity-50">
            {guildUsers?.length} results
          </div>

          <div>
            {guildUsers?.map((member) => {
              return (
                <ListItemExpanded
                  key={member.id}
                  title={member.friendlyName || member.username}
                  headerLabel={`${member.id} / Default Lab ID: ${
                    member.defaultLabId || "--"
                  }`}
                  startImageUrl={member.avatarURL}
                  AdditionalInfoElement={() => {
                    const userRoles = rolesParser(member.roles);
                    return (
                      <div className="pt-4">
                        {!!member.LabGuildUser.length && (
                          <React.Fragment>
                            <p className="mb-3 ml-3 text-base font-bold">
                              Labs
                            </p>
                            <DataDisplay
                              nude
                              className="mb-3"
                              data={member.LabGuildUser?.map(({ Lab }) => ({
                                label: "Lab",
                                value: Lab.displayName,
                              }))}
                            />
                          </React.Fragment>
                        )}

                        <p className="mb-3 ml-3 text-base font-bold">Roles</p>
                        <DataDisplay
                          nude
                          data={userRoles?.map(({ name }) => ({
                            label: "Role",
                            value: name,
                          }))}
                        />
                      </div>
                    );
                  }}
                />
              );
            })}
          </div>
        </div>
      </main>
    </React.Fragment>
  );
});

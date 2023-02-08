import Head from "next/head";
import React from "react";
import { BackButton } from "../../../components/BackButton";
import { DataDisplay } from "../../../components/DataDisplay";
import { Button } from "../../../components/Form/Fields";
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
        <div className="relative">
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
      </main>
    </React.Fragment>
  );
});

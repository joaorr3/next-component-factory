import Head from "next/head";
import Link from "next/link";
import Router from "next/router";
import React from "react";
import {
  IssueFilters,
  type FiltersModel,
} from "../../components/Issue/Filters";
import { IssueCard } from "../../components/Issue/IssueCard";
import { Button } from "../../components/IssueForm/Fields";
import { useHandler } from "../../hooks/useHandler";
import { routes } from "../../routes";
import {
  useGlobalState,
  useLoading,
} from "../../utils/GlobalState/GlobalStateProvider";
import { withRoles } from "../../utils/hoc";
import { trpc } from "../../utils/trpc";

const routeInfo = routes.IssueOpen;

export default withRoles("Issue", () => {
  const {
    state: {
      issues: { searchFilters },
    },
    actions,
  } = useGlobalState();

  const issues = trpc.issues.search.useQuery(searchFilters, {
    staleTime: 300000,
  });

  useLoading(issues.isLoading && issues.fetchStatus !== "idle");

  const handleOnPress = React.useCallback((id?: number) => {
    Router.push(routes.IssueDetail.dynamicPath(String(id)));
  }, []);

  const handleFilters = React.useCallback(
    (values: FiltersModel) => {
      actions.setIssueFilters(values);
    },
    [actions]
  );

  const getDefaultValues = useHandler(() => {
    return searchFilters;
  }, [searchFilters]);

  return (
    <React.Fragment>
      <Head>
        <title>Issues</title>
      </Head>
      <main>
        <div className="mb-20 flex justify-end">
          <Link className="self-end" href={routeInfo.path}>
            <Button>New Issue</Button>
          </Link>
        </div>

        <div className="mb-5">
          <IssueFilters
            onChange={handleFilters}
            defaultValues={getDefaultValues}
          />

          <span className="text grow text-xs opacity-50">
            {issues.data?.length} results
          </span>
        </div>

        <div>
          {issues.data?.map((issue, key) => (
            <IssueCard
              key={key}
              issue={issue}
              onPress={(id) => handleOnPress(id)}
            />
          ))}
        </div>
      </main>
    </React.Fragment>
  );
});

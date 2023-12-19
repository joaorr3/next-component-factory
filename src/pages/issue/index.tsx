import Head from "next/head";
import Router from "next/router";
import React from "react";
import {
  IssueFilters,
  type FiltersModel,
} from "../../components/Issue/Filters";
import { IssueCard } from "../../components/Issue/IssueCard";
import { useHandler } from "../../hooks/useHandler";
import { routes } from "../../routes";
import {
  useGlobalState,
  useLoading,
} from "../../utils/GlobalState/GlobalStateProvider";
import { authLayer } from "../../utils/server-side";
import { trpc } from "../../utils/trpc";

export const getServerSideProps = authLayer("Issue", async () => {
  return {
    props: {},
  };
});

export default function Issue() {
  const {
    state: {
      issues: { searchFilters },
    },
    actions,
  } = useGlobalState();

  const issues = trpc.issues.search.useQuery(searchFilters, {
    // staleTime: 1000 * 60 * 2, // 2 min
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
}

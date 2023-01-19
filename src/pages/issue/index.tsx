import { type Issue } from "@prisma/client";
import { type NextPage } from "next";
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
import { routes } from "../../routes";
import { withRoles } from "../../utils/hoc";
import { trpc } from "../../utils/trpc";

const routeInfo = routes.IssueOpen;

const Issue: NextPage = () => {
  const [filters, setFilters] = React.useState<FiltersModel>({});

  const hasAnyFilter = !!filters.id || !!filters.title || !!filters.author;

  const issues = trpc.issues.search.useQuery(filters);

  const hasResults = hasAnyFilter && !!issues.data?.length;
  const showAllData = !hasAnyFilter && !!issues.data?.length;

  const handleOnPress = React.useCallback((id?: number) => {
    Router.push(routes.IssueDetail.dynamicPath(String(id)));
  }, []);

  const handleFilters = React.useCallback((values: FiltersModel) => {
    setFilters(values);
  }, []);

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

        <IssueFilters onChange={handleFilters} />

        <div>
          {issues.data?.map((issue, key) => (
            <IssueCard
              key={key}
              issue={issue}
              onPress={(id) => handleOnPress(id)}
            />
          ))}
        </div>

        {!hasResults && !showAllData && (
          <div className="flex justify-center">
            <p>No results</p>
          </div>
        )}
      </main>
    </React.Fragment>
  );
};

export default withRoles(Issue, "Issue");

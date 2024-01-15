import Head from "next/head";
import React from "react";
import { authLayer } from "../../utils/server-side";
import { PullRequestCard } from "../../components/PullRequest/PullRequestCard";
import { PullRequestCardInfo } from "../../components/PullRequest/PullRequestCardCount";
import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration'
import { useGlobalState, useLoading } from "../../utils/GlobalState/GlobalStateProvider";
import { trpc } from "../../utils/trpc";
import type { FiltersModel, PRAuthorFilter } from "../../components/PullRequest/Filters";
import { PRFilters } from "../../components/PullRequest/Filters";
import { useHandler } from "../../hooks/useHandler";
import { prismaNext } from "../../server/db/client";

dayjs.extend(duration)

export const getServerSideProps = authLayer("PullRequests", async () => {
  const authors = await prismaNext.guildUser.listCFGuildUsers()

  return {
    props: {
      authors
    },
  };
});

export default function PullRequests({authors}: {authors: PRAuthorFilter[]}) {

  const {
    state: {
      pullRequests: { searchFilters },
    },
    actions,
  } = useGlobalState();

  const prs = trpc.pullRequests.searchOnDashboard.useQuery(searchFilters, {
    // staleTime: 1000 * 60 * 2, // 2 min
  });
  
  useLoading(prs.isLoading && prs.fetchStatus !== "idle");

  const handleFilters = React.useCallback(
    (values: FiltersModel) => {
      actions.setIssueFilters(values);
    },
    [actions]
  );

  const getDefaultValues = useHandler(() => {
    return searchFilters;
  }, [searchFilters]);

  const meanCounts = {
    published: 0,
    completed: 0
  } 

  const sumTimeToPublishInSeconds = prs.data?.list.reduce(( total, pr ) => {
    if(pr.status === 'DRAFT') return total

    meanCounts.published += 1
    const endDate = dayjs(pr.publishedAt)
    const startDate = dayjs(pr.createdAt)
    return total += endDate.diff(startDate, 'second')
  },0) ?? 0

  const sumTimeToCompleteAfterPublishInSeconds = prs.data?.list.reduce(( total, pr ) => {
    if(pr.status === 'DRAFT' || pr.status === 'PENDING') return total

    meanCounts.completed += 1
    const endDate = dayjs(pr.completedAt)
    const startDate = dayjs(pr.publishedAt)
    return total += endDate.diff(startDate, 'second')
  },0) ?? 0
  
  const meanTimeToPublishInSeconds = sumTimeToPublishInSeconds / meanCounts.published
  const meanTimeToCompleteAfterPublishInSeconds = sumTimeToCompleteAfterPublishInSeconds / meanCounts.completed

  const normalizedMeanTimeToPublishInSeconds = isNaN(meanTimeToPublishInSeconds) ? 0 : meanTimeToPublishInSeconds
  const normalizedMeanTimeToCompleteAfterPublishInSeconds = isNaN(meanTimeToCompleteAfterPublishInSeconds) ? 0 : meanTimeToCompleteAfterPublishInSeconds
  const normalizedTotalMeanTimeInSeconds = normalizedMeanTimeToPublishInSeconds + normalizedMeanTimeToCompleteAfterPublishInSeconds

  const durationToPublish = dayjs.duration(normalizedMeanTimeToPublishInSeconds, 'seconds')
  const durationToCompleteAfterPublish = dayjs.duration(normalizedMeanTimeToCompleteAfterPublishInSeconds, 'seconds')
  const durationTotal = dayjs.duration(normalizedTotalMeanTimeInSeconds, 'seconds')

  const convertDurationToHumanReadable = (duration: duration.Duration) => {
    const units = [
        { label: 'Dia', value: duration.days() },
        { label: 'Hora', value: duration.hours() },
        { label: 'Minuto', value: duration.minutes() }
    ];

    const formattedUnits = units
        .filter(unit => unit.value > 0)
        .map(unit => `${unit.value} ${unit.label}${unit.value !== 1 ? 's' : ''}`)
        .join(', ');

    return formattedUnits;
};


  return (
    <React.Fragment>
      <Head>
        <title>Pull Requests</title>
      </Head>

      <div className="mb-5">
        <PRFilters
          authors={authors}
          onChange={handleFilters}
          defaultValues={getDefaultValues}
        />

        <span className="text grow text-xs opacity-50">
          {prs.data?.list.length} results
        </span>
      </div>

      <div className={`grid gap-5 grid-cols-4`}>
        {prs.data?.counts.map( count => {
          const key = `count-${count.status}`

          return <PullRequestCardInfo key={key} label={count.status} info={count.count} />
        })}
      </div>

      {convertDurationToHumanReadable(durationToPublish) && (
        <div className={`grid gap-5 grid-cols-3`}>
          <PullRequestCardInfo label="Publicação" info={convertDurationToHumanReadable(durationToPublish)} />
          <PullRequestCardInfo label="Merge após publicação" info={convertDurationToHumanReadable(durationToCompleteAfterPublish)} />
          <PullRequestCardInfo label="Fluxo Completo" info={convertDurationToHumanReadable(durationTotal)} />
        </div>
      )}
      

      {prs.data?.list.map( pr => {
        return (
          <PullRequestCard key={pr.id} pr={pr} />
        )
      })}
    </React.Fragment>
  );
}

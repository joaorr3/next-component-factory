import { trpc } from "../../utils/trpc";
import { columns } from "./components/columns";

import { DataTable } from "./components/data-table";
import { mergeStatusMap } from "./data/schema";

export default function PullRequestsTable() {
  const { data = [] } = trpc.azure.pullRequest.useQuery();
  // console.log(
  //   "data: ",
  //   data.map((pr) => ({
  //     title: pr.title.substring(0, 4),
  //     rawStatus: pr.mergeStatus,
  //     parsedStatus: mergeStatusMap[pr.mergeStatus],
  //   }))
  // );

  return <DataTable data={data} columns={columns} />;
}

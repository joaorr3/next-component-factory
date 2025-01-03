import { z } from "zod";
import type { PullRequestTableModel } from "../../../components/PullRequestsTable/data/schema";
import { azureSharedClient } from "../../../shared/azure";
import { protectedProcedure, router } from "../trpc";

export const azureRouter = router({
  work: protectedProcedure.query(async () => {
    // const coreApi = await azureSharedClient.client.getCoreApi();
    // const projects = await coreApi.getProjects();
    // const teams = await coreApi.getAllTeams(true);
    // const workApi = await azureSharedClient.client.getWorkApi();
    const workItemApi =
      await azureSharedClient.client?.getWorkItemTrackingApi();

    const query = `
      SELECT *
      FROM WorkItems
      WHERE [System.AreaPath] UNDER "IT.DIT\\DIT\\DesignSystem"
        AND [System.WorkItemType] = "User Story"
      ORDER BY [System.CreatedDate] DESC
    `;

    // const query2 = `
    //   SELECT [System.Id], [System.Title]
    //   FROM WorkItems
    //   WHERE [System.AssignedTo] CONTAINS "Ricardo"
    //     AND [System.AreaPath] UNDER "IT.DIT\\DIT\\DesignSystem"
    //     AND [System.WorkItemType] = "User Story"
    //   ORDER BY [System.CreatedDate] DESC
    // `;

    const res = await workItemApi?.queryByWiql({
      query,
    });

    if (!res) {
      return;
    }

    const { workItems } = res;

    const ids = workItems?.map((wi) => Number(wi.id)) || [];

    const wis = await workItemApi?.getWorkItems(
      ids,
      ["System.Title", "System.AssignedTo"],
      undefined,
      undefined,
      undefined,
      "6972fd8c-2a19-4b27-a72b-d650691f5943"
    );

    if (!wis) {
      return;
    }

    // console.log(
    //   "AssignedTo: ",
    //   wis.map((wi) => wi.fields?.["System.AssignedTo"])
    // );

    const workItemsApi = wis.map(
      (wi) =>
        `${wi.fields?.["System.Title"]} - ${wi.fields?.["System.AssignedTo"]?.["displayName"]}`
    );

    const AssignedTo = wis.map((wi) => wi.fields?.["System.AssignedTo"]);
    console.log("AssignedTo: ", AssignedTo);

    console.log("workItems: ", JSON.stringify(workItemsApi, undefined, 2));

    // console.log("workItems: ", wis[0].fields?.["System.Title"]);

    // const getBacklogs = await workApi.getBacklogs({
    //   projectId: "6972fd8c-2a19-4b27-a72b-d650691f5943",
    //   teamId: "bc39a9d1-7b74-4468-9fe8-1322d77ebe84",
    // });
    // console.log("getBacklogs: ", getBacklogs);

    // console.log("iterations: ", iterations);

    // const backlogs = await workApi.getBacklogs({
    //   projectId: "6972fd8c-2a19-4b27-a72b-d650691f5943",
    //   teamId: "bc39a9d1-7b74-4468-9fe8-1322d77ebe84",
    // });

    // const backlogUS = await workApi.getBacklog(
    //   {
    //     projectId: "6972fd8c-2a19-4b27-a72b-d650691f5943",
    //     teamId: "bc39a9d1-7b74-4468-9fe8-1322d77ebe84",
    //   },
    //   "Microsoft.RequirementCategory"
    // );
    // // console.log("backlogs: ", backlogs);
    // console.log("backlogUS: ", backlogUS);

    // const stories = await workApi.getBoard(
    //   {
    //     projectId: "6972fd8c-2a19-4b27-a72b-d650691f5943",
    //     teamId: "bc39a9d1-7b74-4468-9fe8-1322d77ebe84",
    //   },
    //   "fcb62b23-ec4b-499b-ba06-c4f18f3ae768"
    // );
    // console.log("stories: ", stories);
    // const board = await work.getBoard({ team: "DesignSystem" }, "DesignSystem");
    // console.log("backlogs: ", backlogs);
    // console.log("board: ", board);

    return "OK";
  }),
  pullRequest: protectedProcedure.query(async () => {
    const gitApi = await azureSharedClient.client?.getGitApi();

    const repos = await gitApi?.getRepositories();

    if (!repos) {
      return;
    }

    const designSystemRepo = repos.find(
      (repo) => repo.name === "BCP.DesignSystem"
    );

    const mergeStatusMap = {
      0: "notSet",
      1: "queued",
      2: "conflicts",
      3: "succeeded",
      4: "rejectedByPolicy",
      5: "failure",
    } as const;

    if (designSystemRepo?.id) {
      const dsPullRequests =
        (await gitApi?.getPullRequests(designSystemRepo.id, {})) || [];

      return dsPullRequests.map((pr) => {
        return {
          ...pr,
          mergeStatus:
            mergeStatusMap[pr.mergeStatus as keyof typeof mergeStatusMap],
        };
      }) as unknown as PullRequestTableModel[];
    }

    return [];
  }),
  getPullRequests: protectedProcedure.mutation(async () => {
    return await azureSharedClient.getPullRequests();
  }),
  createItem: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    )
    .mutation(async ({ input: { title, description } }) => {
      await azureSharedClient.createWorkItem({
        title,
        description,
        author: "",
        threadUrl: "",
        tags: [],
      });
    }),
});

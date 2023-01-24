import { type UseRoles } from "../hooks/useRoles";

export type RouteData = {
  label: string;
  path: string;
  match?: string[];
  navBar?: boolean;
  roles?: UseRoles;
};
export type RouteDataWithDynamicPath = RouteData & {
  dynamicPath: <T>(param: T) => string;
};

type Routes = {
  Home: RouteData;
  Kudos: RouteData;
  FAQs: RouteData;
  FAQDetail: RouteDataWithDynamicPath;
  Issue: RouteData;
  IssueDetail: RouteDataWithDynamicPath;
  IssueOpen: RouteData;
  Manage: RouteData;
  ManageComponents: RouteData;
};

export type RoutesKeys = keyof Routes;

export const routes: Routes = {
  Home: {
    label: "Home",
    path: "/",
  },
  Kudos: {
    label: "Kudos",
    path: "/kudos",
    navBar: true,
  },
  Issue: {
    label: "Issues",
    path: "/issue",
    navBar: true,
    match: ["/issue", "/issue/open", "/issue/[id]"],
    roles: {
      anyOf: ["cf", "labs"],
    },
  },
  IssueDetail: {
    label: "Issue Detail",
    path: "/issue/[id]",
    dynamicPath: (param) => `/issue/${param}`,
    roles: {
      anyOf: ["cf", "labs"],
    },
  },
  IssueOpen: {
    label: "Open",
    path: "/issue/open",
    roles: {
      anyOf: ["cf", "labs"],
    },
  },
  FAQs: {
    label: "FAQs",
    path: "/manage/faqs",
    match: ["/manage/faqs", "/manage/faqs/[id]"],
    roles: {
      allOf: ["admin"],
    },
  },
  FAQDetail: {
    label: "FAQ Detail",
    path: "/manage/faqs/[id]",
    dynamicPath: (param) => `/manage/faqs/${param}`,
    roles: {
      allOf: ["admin"],
    },
  },
  Manage: {
    label: "Manage",
    path: "/manage",
    match: [
      "/manage",
      "/manage/faqs",
      "/manage/faqs/[id]",
      "/manage/components",
      "/manage/components/[id]",
    ],
    roles: {
      anyOf: ["cf", "dev"],
    },
  },
  ManageComponents: {
    label: "Components",
    path: "/manage/components",
    roles: {
      anyOf: ["cf", "dev"],
    },
  },
};

export const navBarRouteEntries = Object.entries(routes).filter(
  ([_, { navBar }]) => navBar
) as [RoutesKeys, RouteData][];

export const routeEntries = Object.entries(routes) as [RoutesKeys, RouteData][];

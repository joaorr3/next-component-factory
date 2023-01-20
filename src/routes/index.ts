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
    path: "/faqs",
    // navBar: true,
    match: ["/faqs", "/faqs/[id]"],
    roles: {
      allOf: ["admin"],
    },
  },
  FAQDetail: {
    label: "FAQ Detail",
    path: "/faqs/[id]",
    dynamicPath: (param) => `/faqs/${param}`,
    roles: {
      allOf: ["admin"],
    },
  },
};

export const navBarRouteEntries = Object.entries(routes).filter(
  ([_, { navBar }]) => navBar
) as [RoutesKeys, RouteData][];

export const routeEntries = Object.entries(routes) as [RoutesKeys, RouteData][];

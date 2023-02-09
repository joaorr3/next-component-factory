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
  User: RouteData;
  Kudos: RouteData;
  Issue: RouteData;
  IssueDetail: RouteDataWithDynamicPath;
  IssueOpen: RouteData;
  FAQs: RouteData;
  FAQDetail: RouteDataWithDynamicPath;
  // Manage
  Manage: RouteData;
  ManageMedia: RouteData;
  ManageMediaUpload: RouteData;
  ManageFAQs: RouteData;
  ManageFAQCreate: RouteData;
  ManageFAQDetail: RouteDataWithDynamicPath;
  ManageComponents: RouteData;
  ManageLabs: RouteData;
  ManageLabsDetail: RouteDataWithDynamicPath;
  ManageUsers: RouteData;
};

export type RoutesKeys = keyof Routes;

export const routes: Routes = {
  Home: {
    label: "Home",
    path: "/",
  },
  User: {
    label: "User",
    path: "/user",
    roles: {},
  },
  Kudos: {
    label: "Kudos",
    path: "/kudos",
    navBar: true,
  },
  FAQs: {
    label: "FAQs",
    path: "/faqs",
    match: ["/faqs", "/faqs/[slug]"],
    navBar: true,
  },
  FAQDetail: {
    label: "FAQ Detail",
    path: "/faqs/[slug]",
    dynamicPath: (param) => `/faqs/${param}`,
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
  Manage: {
    label: "Manage",
    path: "/manage",
    match: [
      "/manage",
      "/manage/media",
      "/manage/media/upload",
      "/manage/faqs",
      "/manage/faqs/create",
      "/manage/faqs/[slug]",
      "/manage/components",
      "/manage/components/[id]",
      "/manage/labs",
      "/manage/labs/[id]",
    ],
    roles: {
      anyOf: ["cf", "dev"],
    },
  },
  ManageMedia: {
    label: "Media",
    path: "/manage/media",
    roles: {
      anyOf: ["cf"],
    },
  },
  ManageMediaUpload: {
    label: "Media Upload",
    path: "/manage/media/upload",
    roles: {
      anyOf: ["cf"],
    },
  },
  ManageFAQs: {
    label: "FAQs",
    path: "/manage/faqs",
    roles: {
      anyOf: ["cf"],
    },
  },
  ManageFAQCreate: {
    label: "Add FAQ",
    path: "/manage/faqs/create",
    roles: {
      anyOf: ["cf"],
    },
  },
  ManageFAQDetail: {
    label: "FAQ Detail",
    path: "/manage/faqs/[slug]",
    dynamicPath: (param) => `/manage/faqs/${param}`,
    roles: {
      anyOf: ["cf"],
    },
  },
  ManageComponents: {
    label: "Components",
    path: "/manage/components",
    roles: {
      allOf: ["cf", "dev"],
    },
  },
  ManageLabs: {
    label: "Labs",
    path: "/manage/labs",
    roles: {
      anyOf: ["cf", "dev"],
    },
  },
  ManageLabsDetail: {
    label: "Labs Detail",
    path: "/manage/labs/[id]",
    dynamicPath: (param) => `/manage/labs/${param}`,
    roles: {
      anyOf: ["cf", "dev"],
    },
  },
  ManageUsers: {
    label: "Users",
    path: "/manage/users",
    roles: {
      anyOf: ["cf", "dev"],
    },
  },
};

export const navBarRouteEntries = Object.entries(routes).filter(
  ([_, { navBar }]) => navBar
) as [RoutesKeys, RouteData][];

export const routeEntries = Object.entries(routes) as [RoutesKeys, RouteData][];

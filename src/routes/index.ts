import type { HandleRolesModel } from "../utils/roles";

export type RouteData = {
  label: string;
  path: string;
  match?: string[];
  navBar?: boolean;
  roles: HandleRolesModel;
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
  PublicIssueOpen: RouteData;
  FAQs: RouteData;
  FAQDetail: RouteDataWithDynamicPath;
  Storybook: RouteData;
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
  ManageRoles: RouteData;
  ManageUsers: RouteData;
};

export type RoutesKeys = keyof Routes;

export const routes: Routes = {
  Home: {
    label: "Home",
    path: "/",
    roles: "public",
  },
  User: {
    label: "User",
    path: "/user",
    roles: "user",
  },
  Kudos: {
    label: "Kudos",
    path: "/kudos",
    roles: "public",
  },
  FAQs: {
    label: "FAQs",
    path: "/faqs",
    match: ["/faqs", "/faqs/[slug]"],
    navBar: true,
    roles: "public",
  },
  FAQDetail: {
    label: "FAQ Detail",
    path: "/faqs/[slug]",
    dynamicPath: (param) => `/faqs/${param}`,
    roles: "public",
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
  PublicIssueOpen: {
    label: "Open",
    path: "/issue/form/[secret]",
    roles: "public",
  },
  Storybook: {
    label: "Storybook",
    path: "/storybook",
    navBar: true,
    roles: "public",
  },
  // Manage
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
      "/manage/users",
      "/manage/roles",
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
  ManageRoles: {
    label: "Roles",
    path: "/manage/roles",
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

export const navBarRouteEntries = Object.values(routes).filter(
  ({ navBar }) => navBar
) as RouteData[];

export const routeEntries = Object.entries(routes) as [RoutesKeys, RouteData][];

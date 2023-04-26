import { orderBy } from "lodash";

import { IconCodes, IconNames } from "lib/ui/icons/types";

import { parseEnvVar } from "../util";

import * as paths from "./paths";
import * as types from "./types";

export * from "./types";
export * from "./util";

export const DEFAULT_META_DESCRIPTION = parseEnvVar(
  process.env.NEXT_PUBLIC_DEFAULT_META_DESCRIPTION,
  "NEXT_PUBLIC_DEFAULT_META_DESCRIPTION",
  {
    required: true,
  },
);

export const DEFAULT_PAGE_TITLE = parseEnvVar(
  process.env.NEXT_PUBLIC_DEFAULT_PAGE_TITLE,
  "NEXT_PUBLIC_DEFAULT_PAGE_TITLE",
  {
    required: true,
  },
);

export const DefaultMetaOptions: Required<types.MetaOptions> = {
  description: DEFAULT_META_DESCRIPTION,
};

export const Pages: types.Pages = {
  [types.PageIds.TEMPLATES]: types.createPage({
    id: types.PageIds.TEMPLATES,
    pathname: "/templates",
    label: "Templates",
    icon: { type: IconCodes.REGULAR, name: IconNames.FOLDER_OPEN },
    activeIcon: { type: IconCodes.SOLID, name: IconNames.FOLDER_OPEN },
    active: new RegExp(`^/templates${paths.PATH_END_REGEX_STRING}`),
    head: {
      description: "View templates you have created or templates publically available.",
    },
    /* sidebars: {
         dashboard: {
           label: "Templates",
           icon: { type: IconCodes.REGULAR, name: IconNames.FOLDER_OPEN },
           activeIcon: { type: IconCodes.SOLID, name: IconNames.FOLDER_OPEN },
           subMenu: [
             {
               label: "Discover",
               icon: { type: IconCodes.REGULAR, name: IconNames.CAMERA },
               activeIcon: { type: IconCodes.SOLID, name: IconNames.CAMERA },
               active: new RegExp(`^/discover${paths.PATH_END_REGEX_STRING}`),
               page: types.PageIds.DISCOVER,
             },
             {
               label: "My Templates",
               active: new RegExp(`^/templates${paths.PATH_END_REGEX_STRING}`),
               icon: { type: IconCodes.REGULAR, name: IconNames.COPY },
               activeIcon: { type: IconCodes.SOLID, name: IconNames.COPY },
               page: types.PageIds.TEMPLATES,
               tagText: (user: import("lib/model").User) => `${user.metrics.num_templates}`,
             },
           ],
         },
       }, */
  }),
  [types.PageIds.PROJECTS]: types.createPage({
    id: types.PageIds.PROJECTS,
    pathname: "/projects",
    label: "Projects",
    icon: { type: IconCodes.REGULAR, name: IconNames.FOLDER_OPEN },
    activeIcon: { type: IconCodes.SOLID, name: IconNames.FOLDER_OPEN },
    active: new RegExp(`^/projects${paths.PATH_END_REGEX_STRING}`),
    head: {
      description: "View projects you have created or those that have been shared with you.",
    },
    // sidebars: {
    //   dashboard: {
    //     label: "Budgets",
    //     icon: { type: IconCodes.REGULAR, name: IconNames.FOLDER_OPEN },
    //     activeIcon: { type: IconCodes.SOLID, name: IconNames.FOLDER_OPEN },
    //     subMenu: [
    //       {
    //         label: "Active",
    //         icon: { type: IconCodes.REGULAR, name: IconNames.CAMERA_ALT },
    //         activeIcon: { type: IconCodes.SOLID, name: IconNames.CAMERA_ALT },
    //         active: new RegExp(`^/budgets${paths.PATH_END_REGEX_STRING}`),
    //         page: types.PageIds.BUDGETS,
    //         tagText: (user: import("lib/model").User) => `${user.metrics.num_budgets}`,
    //       },
    //       {
    //         label: "Collaborating",
    //         active: new RegExp(`^/collaborating${paths.PATH_END_REGEX_STRING}`),
    //         icon: { type: IconCodes.REGULAR, name: IconNames.USERS },
    //         activeIcon: { type: IconCodes.SOLID, name: IconNames.USERS },
    //         page: types.PageIds.COLLABORATING_BUDGETS,
    //         tagText: (user: import("lib/model").User) =>
    //           `${user.metrics.num_collaborating_budgets}`,
    //       },
    //       {
    //         label: "Archive",
    //         active: new RegExp(`^/archive${paths.PATH_END_REGEX_STRING}`),
    //         icon: { type: IconCodes.SOLID, name: IconNames.BOOK },
    //         /* icon: { type: IconCodes.REGULAR, name: IconNames.BOOK },
    //            activeIcon: { type: IconCodes.SOLID, name: IconNames.BOOK }, */
    //         page: types.PageIds.COLLABORATING_BUDGETS,
    //         tagText: (user: import("lib/model").User) => `${user.metrics.num_archived_budgets}`,
    //       },
    //     ],
    //   },
    // },
  }),
  [types.PageIds.CONTACTS]: types.createPage({
    id: types.PageIds.CONTACTS,
    pathname: "/contacts",
    label: "Contacts",
    icon: { type: IconCodes.REGULAR, name: IconNames.FOLDER_OPEN },
    activeIcon: { type: IconCodes.SOLID, name: IconNames.FOLDER_OPEN },
    active: new RegExp(`^/contacts${paths.PATH_END_REGEX_STRING}`),
  }),
  [types.PageIds.SETTINGS]: types.createPage({
    id: types.PageIds.SETTINGS,
    label: "Settings",
    pathname: "/settings",
  }),
  [types.PageIds.INTEGRATIONS]: types.createPage({
    id: types.PageIds.INTEGRATIONS,
    pathname: "/integrations",
    label: "Integrations",
  }),
  [types.PageIds.SOURCES]: types.createPage({
    id: types.PageIds.SOURCES,
    pathname: "/sources",
    label: "Sources",
  }),
};

export const PAGES_ARRAY = [
  Pages.settings,
  Pages.contacts,
  Pages.integrations,
  Pages.projects,
  Pages.templates,
  Pages.sources,
] as const;

export type PagesArray = typeof PAGES_ARRAY;

export type PageWithNav<I extends types.NavId> = {
  readonly page: PagesArray[number];
  readonly nav: types.Nav<I>;
};

const getNavIndex = <I extends types.NavId>(n: types.Nav<I>): number | undefined =>
  n.navId === "dashboard" ? n.tabIndex : n.sidebarIndex;

export const getPagesWithNav = <I extends types.NavId>(navId: I): PageWithNav<I>[] =>
  orderBy(
    PAGES_ARRAY.reduce((prev: PageWithNav<I>[], curr: PagesArray[number]): PageWithNav<I>[] => {
      if (curr.isAuthenticated !== false) {
        const navs = (curr.navs || []).filter((n: types.Nav<types.NavId>) => n.navId === navId);
        if (navs.length > 1) {
          throw new Error("");
        } else if (navs.length === 1) {
          return [...prev, { nav: navs[0] as types.Nav<I>, page: curr }];
        }
        return prev;
      }
      return prev;
    }, [] as PageWithNav<I>[]),
    (p: PageWithNav<I>) => getNavIndex(p.nav),
  );

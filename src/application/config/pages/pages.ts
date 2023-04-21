/* eslint-disable-next-line no-restricted-imports -- This is a special case to avoid circular imports. */
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
  [types.PageIds.TEMPLATES]: {
    id: types.PageIds.TEMPLATES,
    pathname: "/templates",
    title: "View Templates",
    head: {
      title: "View Your Templates",
      description: "View templates you have created or templates publically available.",
    },
    sidebars: {
      dashboard: {
        label: "Templates",
        icon: { type: IconCodes.REGULAR, name: IconNames.FOLDER_OPEN },
        activeIcon: { type: IconCodes.SOLID, name: IconNames.FOLDER_OPEN },
        subMenu: [
          {
            label: "Discover",
            icon: { type: IconCodes.REGULAR, name: IconNames.CAMERA_ALT },
            activeIcon: { type: IconCodes.SOLID, name: IconNames.CAMERA_ALT },
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
    },
  },
  [types.PageIds.BUDGETS]: {
    id: types.PageIds.BUDGETS,
    pathname: "/budgets",
    head: {
      title: "View Your Budgets",
      description: "View budgets you have created or those that have been shared with you.",
    },
    sidebars: {
      dashboard: {
        label: "Budgets",
        icon: { type: IconCodes.REGULAR, name: IconNames.FOLDER_OPEN },
        activeIcon: { type: IconCodes.SOLID, name: IconNames.FOLDER_OPEN },
        subMenu: [
          {
            label: "Active",
            icon: { type: IconCodes.REGULAR, name: IconNames.CAMERA_ALT },
            activeIcon: { type: IconCodes.SOLID, name: IconNames.CAMERA_ALT },
            active: new RegExp(`^/budgets${paths.PATH_END_REGEX_STRING}`),
            page: types.PageIds.BUDGETS,
            tagText: (user: import("lib/model").User) => `${user.metrics.num_budgets}`,
          },
          {
            label: "Collaborating",
            active: new RegExp(`^/collaborating${paths.PATH_END_REGEX_STRING}`),
            icon: { type: IconCodes.REGULAR, name: IconNames.USERS },
            activeIcon: { type: IconCodes.SOLID, name: IconNames.USERS },
            page: types.PageIds.COLLABORATING_BUDGETS,
            tagText: (user: import("lib/model").User) =>
              `${user.metrics.num_collaborating_budgets}`,
          },
          {
            label: "Archive",
            active: new RegExp(`^/archive${paths.PATH_END_REGEX_STRING}`),
            icon: { type: IconCodes.SOLID, name: IconNames.BOOK },
            /* icon: { type: IconCodes.REGULAR, name: IconNames.BOOK },
               activeIcon: { type: IconCodes.SOLID, name: IconNames.BOOK }, */
            page: types.PageIds.COLLABORATING_BUDGETS,
            tagText: (user: import("lib/model").User) => `${user.metrics.num_archived_budgets}`,
          },
        ],
      },
    },
  },
  [types.PageIds.DISCOVER]: {
    id: types.PageIds.DISCOVER,
    pathname: "/discover",
  },
  [types.PageIds.COLLABORATING_BUDGETS]: {
    id: types.PageIds.COLLABORATING_BUDGETS,
    pathname: "/collaborating",
  },
  [types.PageIds.ARCHIVED_BUDGETS]: {
    id: types.PageIds.ARCHIVED_BUDGETS,
    pathname: "/archive",
  },
};

export const getSidebarItems = <T extends types.SidebarId>(id: T): types.SidebarItemConfig<T>[] =>
  Object.keys(Pages).reduce(
    (prev: types.SidebarItemConfig<T>[], pageId: string): types.SidebarItemConfig<T>[] => {
      const page = Pages[pageId as types.PageId];
      if (page.sidebars !== undefined) {
        const s = page.sidebars[id];
        if (s !== undefined) {
          return [...prev, s];
        }
      }
      return prev;
    },
    [] as types.SidebarItemConfig<T>[],
  );

/* title: params => (params.machine === undefined ? "Machine" : `${params.machine.name}`),
       head: params => ({
         title:
           params.machine === undefined
             ? "Corsha Console - Machine"
             : `Corsha Console - ${params.machine.name}`,
         description:
           params.machine === undefined
             ? "Monitor and manage your machine."
             : `Monitor and manage ${params.machine.name}`,
       }),
     }, */

import { ui } from "lib";

import * as paths from "./paths";
import * as types from "./types";

export * from "./types";
export * from "./util";

export const DEFAULT_META_DESCRIPTION = "Corsha Console";
export const DEFAULT_PAGE_TITLE = "Corsha Console";

export const DefaultMetaOptions: Required<types.MetaOptions> = {
  description: DEFAULT_META_DESCRIPTION,
};

export const SidebarPages: types.SidebarPages = {
  [types.PageIds.DASHBOARD]: {
    id: types.PageIds.DASHBOARD,
    icon: ui.IconNames.CHART_SIMPLE,
    pathname: "/",
    location: types.SidebarPageLocations.CENTER,
    title: "Dashboard",
  },
  [types.PageIds.MACHINES]: {
    id: types.PageIds.MACHINES,
    icon: ui.IconNames.DATABASE,
    pathname: "/machines",
    location: types.SidebarPageLocations.CENTER,
    title: "Machines",
    // The sidebar item should be active if the path is either /machines or /machines/<id>.
    active: [paths.MACHINES_PATH_REGEX, paths.MACHINE_PATH_REGEX],
    head: {
      title: "Corsha Console - Machines",
      description: "Monitor and manage machines in your network.",
    },
  },
  [types.PageIds.MACHINE_GROUPS]: {
    id: types.PageIds.MACHINE_GROUPS,
    icon: ui.IconNames.CIRCLE_NODES,
    pathname: "/machine-groups",
    location: types.SidebarPageLocations.CENTER,
    title: "Machine Groups",
    head: {
      title: "Corsha Console - Machine Groups",
      description: "Group machines together to monitor and manage with scale.",
    },
  },
  [types.PageIds.PRIMER_SECRETS]: {
    id: types.PageIds.PRIMER_SECRETS,
    icon: ui.IconNames.SHIELD,
    pathname: "/primer-secrets",
    location: types.SidebarPageLocations.CENTER,
    title: "Primer Secrets",
    head: {
      title: "Corsha Console - Primer Secrets",
    },
  },
  [types.PageIds.USER_MANAGEMENT]: {
    id: types.PageIds.USER_MANAGEMENT,
    icon: ui.IconNames.USER_GROUP,
    pathname: "/user-management",
    location: types.SidebarPageLocations.CENTER,
  },
  [types.PageIds.POLICIES]: {
    id: types.PageIds.POLICIES,
    icon: ui.IconNames.TRIANGLE_EXCLAMATION,
    pathname: "/policies",
    location: types.SidebarPageLocations.CENTER,
  },
  [types.PageIds.AUDIT]: {
    id: types.PageIds.AUDIT,
    icon: ui.IconNames.FILE_LINES,
    pathname: "/audit",
    location: types.SidebarPageLocations.CENTER,
  },
  [types.PageIds.SUPPORT]: {
    id: types.PageIds.SUPPORT,
    icon: ui.IconNames.CIRCLE_QUESTION,
    pathname: "/support",
    location: types.SidebarPageLocations.BOTTOM,
    emphasize: true,
    active: false,
  },
};

export const Pages: types.Pages = {
  ...SidebarPages,
  [types.PageIds.MACHINE]: {
    id: types.PageIds.MACHINE,
    title: params => (params.machine === undefined ? "Machine" : `${params.machine.name}`),
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
  },
};

import { isNil } from "lodash";

import { isParentSidebarItem } from "./typeguards";

export const sidebarItemIsActive = (
  item: IExpandedSidebarItem | ICollapsedSidebarItem,
  location: { pathname: string }
): boolean => {
  if (isParentSidebarItem(item)) {
    for (let i = 0; i < item.submenu.length; i++) {
      if (sidebarItemIsActive(item.submenu[i], location)) {
        return true;
      }
    }
    return false;
  } else {
    if (!isNil(item.active)) {
      return item.active;
    }
    if (!isNil(item.activePathRegexes)) {
      for (let i = 0; i < item.activePathRegexes.length; i++) {
        if (item.activePathRegexes[i].exec(location.pathname)) {
          return true;
        }
      }
    }
    if (!isNil(item.to) && location.pathname.startsWith(item.to)) {
      return true;
    }
    return false;
  }
};

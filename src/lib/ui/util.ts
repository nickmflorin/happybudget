import { isNil } from "lodash";

import { isParentSidebarItem } from "./typeguards";

export const toSelectModel = <M extends Model.Model>(m: Model.WithStringId<M>): M =>
  ({ ...m, id: parseInt(m.id) } as M);

export const toSelectOption = <M extends Model.Model>(m: M): Model.WithStringId<M> => ({ ...m, id: String(m.id) });

export const itemIsActive = (
  item: IExpandedSidebarItem | ICollapsedSidebarItem,
  location: { pathname: string }
): boolean => {
  if (isParentSidebarItem(item)) {
    for (let i = 0; i < item.submenu.length; i++) {
      if (itemIsActive(item.submenu[i], location)) {
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
        if (location.pathname.match(item.activePathRegexes[i])) {
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

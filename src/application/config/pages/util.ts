import { logger } from "internal";
import { validators } from "lib";

import * as types from "./types";

/**
 * Returns whether or not the sidebar item associated with the provided item configuration,
 * {@link types.SidebarItemConfig}, should be hidden and not accessible from the layout's sidebar.
 *
 * Hiding an item from the sidebar should be used in cases where conditional logic, such as
 * permissions based controls, warrant that a given user should not have access to a given page
 * and thus, should not be allowed to navigate to the page via the sidebar.  It does not prevent
 * that page from being accessed, it merely hides the clickable item associated with that page in
 * the sidebar.
 *
 * @param {string} currentPath
 *   The path as shown in the browser including the search params and respecting the trailingSlash
 *   configuration. basePath and locale are not included.
 *
 *   This parameter should be defined based on the `asPath` parameter of the {@link NextRouter}
 *   object.
 *
 *   Reference: https://nextjs.org/docs/api-reference/next/router#router-object
 *
 * @param {Pick<types.SidebarPage<I, P, N>, "hidden">} page
 *   The page, {@link types.SidebarPage}, corresponding to the page whose visibility is being
 *   determined by the method.
 *
 * @returns {bool}
 */
export const sidebarItemIsHidden = <T extends types.SidebarId, P extends string = string>(
  sidebarItem: Pick<types.SidebarItemConfig<T, P>, "hidden">,
  currentPath: string,
): boolean => {
  switch (typeof sidebarItem.hidden) {
    case "function":
      return sidebarItem.hidden(currentPath);
    case "boolean":
      return sidebarItem.hidden;
    default:
      return false;
  }
};

export const sidebarItemControlIsActive = <P extends string = string>(
  control: types.SidebarItemActiveStateControl<P>,
  path: string,
): boolean => {
  if (typeof control === "boolean") {
    return control;
  } else if (!Array.isArray(control)) {
    switch (typeof control) {
      case "function":
        return control(path);
      case "string":
        return path === control;
      default:
        return control.test(path);
    }
  }
  return validators.validateAny(control, (a: types.SidebarItemActiveStateControl<P>) =>
    sidebarItemControlIsActive<P>(a, path),
  );
};

/**
 * Returns whether or not the sidebar item associated with the provided item configuration,
 * {@link types.SidebarItemConfig}, is active based on the current path in the browser.
 *
 * A given sidebar item, {@link types.SidebarItemConfig}, will be treated as active if the
 * 'active' property is defined and it evaluates to 'true'.  This 'active' property can be defined
 * as any of the following:
 *
 * 1. A string path name {@link string}
 *    In this case, the sidebar item, {@link types.SidebarItemConfig}, will be treated as active
 *    if the 'active' property is equal to the current path as seen in the browser.
 *
 * 2. A regular expression {@link RegExp}
 *    In this case, the sidebar item, {@link types.SidebarItemConfig}, will be treated as active
 *    if the regular expression matches the current pathname as seen in the browser.
 *
 * 3. A callback function {@link SidebarPagePathCallback}
 *    In this case, the sidebar item, {@link types.SidebarItemConfig}, will be treated as active
 *    if the callback function returns 'true' when called with the current path as seen in the
 *    browser as its first and only argument.
 *
 * 4. An array of regular expressions, string pathnames and/or callback functions,
 *    {@link (string | RegExp | SidebarPagePathCallback)[]}.  In this case, the sidebar item,
 *    {@link types.SidebarItemConfig}, will be treated as active if any of the regular expressions
 *    in the array match the current pathname as seen in the browser, if any of the string values
 *    in the array equal the current pathname as seen in the browser, or if any of the callback
 *    functions, {@link SidebarPagePathCallback}, in the array evaluate to 'true' when called with
 *    the current path as seen in the browser as its first and only argument.
 *
 * @see {BaseSidebarItemConfig}
 *
 * @param {string} path
 *   The path as shown in the browser including the search params and respecting the trailingSlash
 *   configuration. basePath and locale are not included.
 *
 *   This parameter should be defined based on the `asPath` parameter of the {@link NextRouter}
 *   object.
 *
 *   Reference: https://nextjs.org/docs/api-reference/next/router#router-object
 *
 * @param {types.SidebarItemConfig<T, P>,} sidebarItem
 *   The configuration representing the sidebar item whose 'active' state is being determined by the
 *   method.
 *
 * @returns {bool}
 */
export const sidebarItemIsActive = <T extends types.SidebarId, P extends string = string>(
  sidebarItem: types.SidebarItemConfig<T, P>,
  path: string,
): boolean => {
  if (sidebarItem.active !== undefined) {
    return sidebarItemControlIsActive(sidebarItem.active, path);
  }
  const subMenu = (sidebarItem as types.DashboardSidebarItemConfig<P>).subMenu;
  if (subMenu !== undefined) {
    return validators.validateAny(subMenu, (a: types.DashboardSidebarSubItemConfig) =>
      sidebarItemIsActive(a, path),
    );
  }
  logger.warn("The sidebar item does not define an active state control, it will never be active.");
  return false;
};

import { validators } from "lib";

import * as types from "./types";

/**
 * Returns whether or not the given page, {@link types.SidebarPage}, should be hidden and not
 * accessible from the layout's sidebar.
 *
 * Hiding a page from the sidebar should be used in cases where conditional logic, such as
 * permissions based controls, warrant that a given user should not have access to a given page
 * and thus, should not be allowed to navigate to the page via the sidebar.
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
export const sidebarPageIsHidden = <
  I extends types.SidebarPageId = types.SidebarPageId,
  P extends string = string,
>(
  currentPath: string,
  props: Pick<types.SidebarPage<I, P>, "hidden">,
): boolean => {
  switch (typeof props.hidden) {
    case "function":
      return props.hidden(currentPath);
    case "boolean":
      return props.hidden;
    default:
      return false;
  }
};

/**
 * Returns whether or not the given page, {@link types.SidebarPage}, is active based on the current
 * path as shown in the browser.
 *
 * By default, a given page, {@link types.SidebarPage}, will be treated as being "active" if its
 * `pathname` is equal to the current path, {@link string}.  However, the `pathname` refers to the
 * path that should be navigated too when the associated sidebar item is clicked - and it will
 * almost always be the case that the sidebar page, {@link types.SidebarPage}, should be treated as
 * "active" for other cases.
 *
 * For instance, if we have a page, {@link types.SidebarPage}, that has a `pathname` value of
 * "/machines", it is likely the case that we will want this to be considered "active" if the
 * current path as shown in the browser is also, say, "/machines/<id>".
 *
 * For this reason, the `active` attribute is exposed on the page, {@link types.SidebarPage}, which
 * can control the "active" state of a given page, {@link types.SidebarPage}, when it differs from
 * just the page's `pathname` alone.
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
 * @param {Pick<types.SidebarPage<I, P, N>, "pathname" | "active">} page
 *   The page, {@link types.SidebarPage}, corresponding to the page whose "active" state is being
 *   determined by the method.
 *
 * @returns {bool}
 */
export const sidebarPageIsActive = <
  I extends types.SidebarPageId = types.SidebarPageId,
  P extends string = string,
>(
  currentPath: string,
  page: Pick<types.SidebarPage<I, P>, "pathname" | "active">,
): boolean => {
  /* If the `active` property of the page is undefined, the determination of an "active" state
     should be made solely from the page's `pathname`. */
  const activeControl = page.active === undefined ? page.pathname : page.active;
  if (activeControl === false) {
    return false;
  }
  if (!Array.isArray(activeControl)) {
    switch (typeof activeControl) {
      case "function":
        return activeControl(currentPath);
      case "string":
        return currentPath === activeControl;
      default:
        return activeControl.test(currentPath);
    }
  }
  return validators.validateAny(activeControl, (a: types.SidebarPagePathSelector<P>) =>
    sidebarPageIsActive<I, P>(currentPath, { pathname: page.pathname, active: a }),
  );
};

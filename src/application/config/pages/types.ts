/* eslint-disable-next-line no-restricted-imports -- This is a special case to avoid circular imports. */
import { enumeratedLiterals } from "lib/util/literals";
/* eslint-disable-next-line no-restricted-imports -- This is a special case to avoid circular imports. */
import { EnumeratedLiteralType } from "lib/util/types/literals";

import * as api from "../../api";

export type MetaOptionName = "description";

export type MetaOptions = { [key in MetaOptionName]?: string };

export type HeadOptions = MetaOptions & {
  readonly title?: string;
};

export type ClientPath<P extends string = string> = api.RequestPath<P, "GET">;

export const NavIds = enumeratedLiterals(["dashboard", "budgeting"] as const);
export type NavId = EnumeratedLiteralType<typeof NavIds>;

export type BaseNav<I extends NavId> = {
  readonly navId: I;
};

export type DashboardNav = BaseNav<"dashboard"> & {
  readonly tabIndex?: number;
};

export type BudgetingNav = BaseNav<"budgeting"> & {
  readonly sidebarIndex?: number;
};

export type Nav<I extends NavId> = {
  dashboard: DashboardNav;
  budgeting: BudgetingNav;
}[I];

export type Navs = (BudgetingNav | DashboardNav)[];

export const PageIds = enumeratedLiterals([
  "templates",
  "projects",
  "contacts",
  "integrations",
  "sources",
  "settings",
] as const);

export type PageId = EnumeratedLiteralType<typeof PageIds>;

export type PageCallbackParams = {
  readonly path: string;
};

export type AuthenticatedPageCallbackParams = PageCallbackParams & {
  readonly user: import("lib/model").User;
};

export type PageCallback<
  V extends string | number | Record<string, unknown> | boolean,
  P extends PageCallbackParams = PageCallbackParams,
> = (p: P) => V;

export type PageParam<
  V extends string | number | Record<string, unknown> | boolean,
  P extends PageCallbackParams = PageCallbackParams,
> = V | PageCallback<V, P>;

export type PageActivePathSelector<P extends string = string> =
  | ClientPath<P>
  | RegExp
  | PageCallback<boolean>;

export type ActiveStateControl<P extends string = string> =
  | PageActivePathSelector<P>
  | PageActivePathSelector<P>[];

type BasePage<
  I extends PageId,
  P extends string,
  PARAMS extends PageCallbackParams = PageCallbackParams,
> = import("lib/model").Model<I> & {
  readonly head?: PageParam<HeadOptions, PARAMS>;
  readonly title?: PageParam<string, PARAMS>;
  /**
   * The path that the router will push to the browser history in the event that the page is being
   * navigated to via a link.  For any sidebar items that are associated with this page,
   * {@link Page}, the determination of whether or not the sidebar item is active will be made based
   * on this 'pathname' property if the 'pathRegex' is not specified on either the page itself and
   * the sidebar item does not specify an 'active' property.
   */
  readonly pathname: ClientPath<P>;
};

export type AuthenticatedPage<I extends PageId, P extends string> = BasePage<
  I,
  P,
  AuthenticatedPageCallbackParams
> & {
  readonly isAuthenticated?: true;
  /**
   * Whether or not the sidebar item should be treated as being in the "active" state.
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
   * 3. A callback function {@link PagePathCallback}
   *    In this case, the sidebar item, {@link types.SidebarItemConfig}, will be treated as active
   *    if the callback function returns 'true' when called with the current path as seen in the
   *    browser as its first and only argument.
   *
   * 4. An array of regular expressions, string pathnames and/or callback functions,
   *    {@link (string | RegExp | PagePathCallback)[]}.  In this case, the sidebar item,
   *    {@link types.SidebarItemConfig}, will be treated as active if any of the regular expressions
   *    in the array match the current pathname as seen in the browser, if any of the string values
   *    in the array equal the current pathname as seen in the browser, or if any of the callback
   *    functions, {@link PagePathCallback}, in the array evaluate to 'true' when called with
   *    the current path as seen in the browser as its first and only argument.
   */
  readonly active?: ActiveStateControl<P>;
  readonly label: string;
  /**
   * Whether or not the page should be hidden from the sidebar based on dynamic conditions, such
   * as permissions that the user has.
   *
   * Note: This alone is obviously not enough to guarantee that they cannot access the page - this
   * is merely just removing the clickable link from their view.
   */
  readonly hidden?: PageParam<boolean>;
  readonly icon?: import("lib/ui").IconProp;
  /**
   * The icon, {@link ui.IconProp}, that should be displayed in the sidebar item whenthe sidebar
   * item is in the "active" state.  If not defined, the icon defined by the 'icon' property will
   * be used for both the "active" and the "inactive" states.
   */
  readonly activeIcon?: import("lib/ui").IconProp;
  readonly tooltip?: import("lib/ui").Tooltip;
  readonly navs?: Navs;
};

export type PublicPage<I extends PageId, P extends string> = BasePage<I, P> & {
  readonly isAuthenticated: false;
};

export type Page<I extends PageId, P extends string> = AuthenticatedPage<I, P> | PublicPage<I, P>;

export type Pages<P extends string = string> = { [key in PageId]: Page<key, P> };

export const insertUserNameInTitle = (user: import("lib/model").User, value: string) =>
  user.full_name !== "" ? `${user.full_name} | ${value}` : value;

export const createPage = <I extends PageId, P extends string, PG extends Page<I, P>>(
  page: PG,
): PG => {
  if (page.isAuthenticated) {
    const defaultTitle = (params: AuthenticatedPageCallbackParams) =>
      insertUserNameInTitle(params.user, page.label);
    return {
      title: defaultTitle,
      ...page,
      head: (params: AuthenticatedPageCallbackParams) => ({
        title: defaultTitle,
        ...(typeof page.head === "function" ? page.head(params) : page.head),
      }),
    };
  }
  return page;
};

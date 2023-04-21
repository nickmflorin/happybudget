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

export const SidebarIds = enumeratedLiterals(["dashboard", "budgeting"] as const);
export type SidebarId = EnumeratedLiteralType<typeof SidebarIds>;

export const PageIds = enumeratedLiterals([
  "templates",
  "discover",
  "budgets",
  "collaborating-budgets",
  "archived-budgets",
] as const);

export type PageId = EnumeratedLiteralType<typeof PageIds>;

export type SidebarPagePathCallback = (v: string) => boolean;

export type SidebarPageActivePathSelector<P extends string = string> =
  | ClientPath<P>
  | RegExp
  | SidebarPagePathCallback;

export type SidebarItemActiveStateControl<P extends string = string> =
  | SidebarPageActivePathSelector<P>
  | SidebarPageActivePathSelector<P>[];

/**
 * Defines the types of parameters that can be provided to callbacks for a given page, {@link Page}.
 */
export type PageCallbackParams = Record<never, string>;

export type PageCallbackParam<T, I extends PageId> = I extends keyof PageCallbackParams
  ? T | ((params: PageCallbackParams[I]) => T)
  : T;

export type BaseSidebarItemConfig<P extends string = string> = {
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
   */
  readonly active?: SidebarItemActiveStateControl<P>;
  /**
   * Whether or not the page should be hidden from the sidebar based on dynamic conditions, such
   * as permissions that the user has.
   *
   * Note: This alone is obviously not enough to guarantee that they cannot access the page - this
   * is merely just removing the clickable link from their view.
   */
  readonly hidden?: boolean | SidebarPagePathCallback;
  readonly icon: import("lib/ui").IconProp;
  /**
   * The icon, {@link ui.IconProp}, that should be displayed in the sidebar item whenthe sidebar
   * item is in the "active" state.  If not defined, the icon defined by the 'icon' property will
   * be used for both the "active" and the "inactive" states.
   */
  readonly activeIcon?: import("lib/ui").IconProp;
  readonly tooltip?: import("lib/ui").Tooltip;
};

export type DashboardSidebarSubItemConfig<
  I extends PageId = PageId,
  P extends string = string,
> = BaseSidebarItemConfig<P> & {
  readonly label: string;
  readonly page: I;
  readonly tagText?: (user: import("lib/model").User) => string;
};

export type DashboardSidebarItemConfig<P extends string = string> = BaseSidebarItemConfig<P> & {
  readonly label: string;
  readonly subMenu?: DashboardSidebarSubItemConfig[];
};

export type BudgetingSidebarItemConfig<P extends string = string> = BaseSidebarItemConfig<P>;

export type SidebarItemConfig<SI extends SidebarId = SidebarId, P extends string = string> = {
  readonly dashboard: DashboardSidebarItemConfig<P>;
  readonly budgeting: BudgetingSidebarItemConfig<P>;
}[SI];

export type AnySidebarItemConfig<P extends string = string> =
  | DashboardSidebarItemConfig<P>
  | BudgetingSidebarItemConfig<P>;

export type Page<
  I extends PageId = PageId,
  P extends string = string,
> = import("lib/model").Model<I> & {
  readonly head?: PageCallbackParam<HeadOptions, I>;
  readonly title?: PageCallbackParam<string, I>;
  // TODO: Figure out how to dynamically force pages to render a 404 if they are hidden.
  readonly hidden?: boolean;
  /**
   * The path that the router will push to the browser history in the event that the page is being
   * navigated to via a link.  For any sidebar items that are associated with this page,
   * {@link Page}, the determination of whether or not the sidebar item is active will be made based
   * on this 'pathname' property if the 'pathRegex' is not specified on either the page itself and
   * the sidebar item does not specify an 'active' property.
   */
  readonly pathname: ClientPath<P>;
  readonly sidebars?: Partial<{ [key in SidebarId]: Omit<SidebarItemConfig<key, P>, "page"> }>;
};

export type Pages<P extends string = string> = { [key in PageId]: Page<key, P> };

import { http, model, ui, enumeratedLiterals, EnumeratedLiteralType } from "lib";

export type MetaOptionName = "description";

export type MetaOptions = { [key in MetaOptionName]?: string };

export type HeadOptions = MetaOptions & {
  readonly title?: string;
};

// IDs for pages that are directly navigatable to via the sidebar.
export const SidebarPageIds = enumeratedLiterals([
  "dashboard",
  "machines",
  "machine-groups",
  "primer-secrets",
  "user-management",
  "policies",
  "audit",
  "support",
] as const);

export type SidebarPageId = EnumeratedLiteralType<typeof SidebarPageIds>;

/* IDs for all pages in the application, regardless of whether or not they are directly navigatable
   to via the sidebar. */
export const PageIds = SidebarPageIds.extend(["machine"] as const);
export type PageId = EnumeratedLiteralType<typeof PageIds>;

export type SidebarPagePathCallback = (v: string) => boolean;

export type SidebarPagePathSelector<P extends string = string> =
  | http.ClientPath<P>
  | RegExp
  | SidebarPagePathCallback;

export const SidebarPageLocations = enumeratedLiterals(["center", "bottom"] as const);
export type SidebarPageLocation = EnumeratedLiteralType<typeof SidebarPageLocations>;

/**
 * Defines the types of parameters that can be provided to callbacks for a given page, {@link Page}.
 */
export type PageCallbackParams = {
  readonly machine: { machine?: model.ApiMachine };
};

export type PageCallbackParam<T, I extends PageId> = I extends keyof PageCallbackParams
  ? T | ((params: PageCallbackParams[I]) => T)
  : T;

export type Page<
  I extends PageId = PageId,
  T extends Omit<model.Model<I>, "id"> | undefined = undefined,
> = T extends undefined
  ? model.Model<I> & {
      readonly head?: PageCallbackParam<HeadOptions, I>;
      readonly title?: PageCallbackParam<string, I>;
    }
  : T & Page<I>;

export type Pages = { [key in PageId]: Page<key> };
export type SidebarPages = { [key in SidebarPageId]: SidebarPage<key> };

/**
 * Represents a page that can be navigated to via the sidebar in the main application layout.
 */
export type SidebarPage<I extends SidebarPageId = SidebarPageId, P extends string = string> = Page<
  I,
  {
    readonly icon: ui.IconName;
    /**
     * The path that the router will push to the browser history in the event that the sidebar
     * anchor in the sidebar is clicked.
     */
    readonly pathname: http.ClientPath<P>;
    /**
     * When a sidebar page is "emphasized", the icon that it contains will be very slightly larger
     * than the other icons.
     */
    readonly emphasize?: boolean;
    /**
     * Where the navigation item for the page will be shown in the sidebar.
     * Default: "center"
     */
    readonly location: SidebarPageLocation;
    /**
     * Whether or not the sidebar page is in the "active" state, if the "active" state alone cannot
     * be determined solely from the `pathname`.
     *
     * By default, a given page, {@link SidebarPage}, will be treated as being "active" if its
     * `pathname` is equal to the current path as seen in the browser, {@link string}.  However, the
     * `pathname` refers to the path that should be navigated too when the associated sidebar item
     * is clicked - and it will almost always be the case that the sidebar page,
     * {@link SidebarPage}, should be treated as "active" for other cases.
     *
     * For instance, if we have a page, {@link SidebarPage}, that has a `pathname` value of
     * "/machines", it is likely the case that we will want this to be considered "active" if the
     * current path as shown in the brower is also, say, "/machines/<id>".
     *
     * In those cases (and similar ones), this property should be used - because the `pathname` that
     * the item should navigate to on click differs from the `pathname` forms that would warrant it
     * being in the "active" state.
     *
     * Forms:
     * -----
     * 1. A ReGex (i.e. regular expression) that will be tested against the current path as seen in
     *    the browser.
     * 2. A pathname that should be checked for equality (similarly to the case of the `pathname`
     *    prop.)
     * 3. A callback function that takes the current path as the browser sees as its argument, and
     *    returns a boolean ({@link SidebarPagePathCallback}).
     * 4. An array of any of the above.  If any criteria in the array are met, the page will be
     *    treated as being in the "active" state.
     * 5. False - The element should never indicate an "active" state, even if it's pathname is the
     *    current path as the browser sees.
     */
    readonly active?: SidebarPagePathSelector<P> | SidebarPagePathSelector<P>[] | false;
    /**
     * Whether or not the page should be hidden from the sidebar based on dynamic conditions, such
     * as permissions that the user has.
     *
     * Note: This alone is obviously not enough to guarantee that they cannot access the page - this
     * is merely just removing the clickable link from their view.
     */
    readonly hidden?: boolean | SidebarPagePathCallback;
  }
>;

export type ILayoutRef = {
  readonly setSidebarVisible: (v: boolean) => void;
  readonly sidebarVisible: boolean;
  readonly toggleSidebar: () => void;
};

export type ILazyBreadCrumbItem<P extends Record<string, unknown> = Record<string, unknown>> = {
  readonly requiredParams: (keyof P)[];
  readonly func: (params: P) => IBreadCrumbItem | IBreadCrumbItem[];
};

declare interface IBreadCrumbItem extends Omit<MenuItemModel, "render"> {
  readonly tooltip?: Tooltip;
  readonly options?: MenuItemModel[];
  readonly primary?: boolean;
  readonly renderContent?: () => JSX.Element;
}

declare interface ISidebarItem {
  readonly icon?: IconOrElement | null | undefined;
  readonly activeIcon?: IconOrElement | null | undefined;
  readonly to?: string;
  readonly active?: boolean;
  readonly hidden?: boolean;
  readonly activePathRegexes?: RegExp[];
  readonly separatorAfter?: boolean;
  readonly tooltip?: Tooltip;
  readonly tagText?: string | number;
  readonly onClick?: () => void;
}

export type ICollapsedSidebarItem = ISidebarItem;

export type IExpandedSingleSidebarItem = ISidebarItem & {
  readonly label: string;
  readonly default?: boolean;
};

export type IExpandedParentSidebarItem = Omit<
  ISidebarItem,
  "to" | "active" | "activePathRegexes" | "tooltip"
> & {
  readonly submenu: IExpandedSingleSidebarItem[];
  readonly label: string;
};

export type IExpandedSidebarItem = IExpandedSingleSidebarItem | IExpandedParentSidebarItem;

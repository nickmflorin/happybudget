declare type ILayoutRef = {
  readonly setSidebarVisible: (v: boolean) => void;
  readonly sidebarVisible: boolean;
  readonly toggleSidebar: () => void;
};

declare interface ILazyBreadCrumbItem {
  readonly requiredParams: string[];
  readonly func: (params: any) => IBreadCrumbItem | IBreadCrumbItem[];
}

declare interface IBreadCrumbItem extends Omit<MenuItemModel, "render"> {
  readonly tooltip?: Tooltip;
  readonly options?: MenuItemModel[];
  readonly primary?: boolean;
  readonly render?: () => React.ReactChild;
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
  readonly closeSidebarOnClick?: () => void;
  readonly onClick?: () => void;
}

declare interface ICollapsedSidebarItem extends ISidebarItem {}

declare type IExpandedSingleSidebarItem = ISidebarItem & {
  readonly label: string;
};

declare type IExpandedParentSidebarItem = Omit<
  ISidebarItem,
  "to" | "onClick" | "closeSidebarOnClick" | "active" | "activePathRegexes" | "tooltip"
> & {
  readonly submenu: IExpandedSingleSidebarItem[];
  readonly label: string;
};

declare type IExpandedSidebarItem = IExpandedSingleSidebarItem | IExpandedParentSidebarItem;

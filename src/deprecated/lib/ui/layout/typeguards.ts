export const isParentSidebarItem = (
  obj: IExpandedSidebarItem | ICollapsedSidebarItem,
): obj is IExpandedParentSidebarItem => (obj as IExpandedParentSidebarItem).submenu !== undefined;

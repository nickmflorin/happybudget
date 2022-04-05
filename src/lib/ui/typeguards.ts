import React from "react";

export const iconIsJSX = (icon: IconOrElement): icon is JSX.Element => React.isValidElement(icon);

export const clickableIconIsCallback = (icon: ClickableIconOrElement): icon is ClickableIconCallback =>
  typeof icon === "function";

export const isParentSidebarItem = (
  obj: IExpandedSidebarItem | ICollapsedSidebarItem
): obj is IExpandedParentSidebarItem => (obj as IExpandedParentSidebarItem).submenu !== undefined;

export const isSelectErrorOption = <O>(option: O | SelectErrorOption): option is SelectErrorOption =>
  (option as SelectErrorOption).isError === true;

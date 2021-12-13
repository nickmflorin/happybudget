import React from "react";

import GenericSidebarItem from "./GenericSidebarItem";
import ParentSidebarItem from "./ParentSidebarItem";

const isParentSidebarItem = (obj: IExpandedSidebarItem): obj is IExpandedParentSidebarItem =>
  (obj as IExpandedParentSidebarItem).submenu !== undefined;

const ExpandedSidebarItem = (props: IExpandedSidebarItem & StandardComponentProps): JSX.Element => {
  if (isParentSidebarItem(props)) {
    return <ParentSidebarItem {...props} />;
  }
  return (
    <GenericSidebarItem<IExpandedSidebarItem> {...props}>
      <span className={"text-container"}>{props.label}</span>
    </GenericSidebarItem>
  );
};

export default React.memo(ExpandedSidebarItem);

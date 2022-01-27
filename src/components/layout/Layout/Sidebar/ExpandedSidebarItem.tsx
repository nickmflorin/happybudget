import React from "react";

import { ui } from "lib";

import GenericSidebarItem from "./GenericSidebarItem";
import ParentSidebarItem from "./ParentSidebarItem";

const ExpandedSidebarItem = (
  props: IExpandedSidebarItem & StandardComponentProps & { readonly closeSidebarOnClick?: () => void }
): JSX.Element => {
  if (ui.typeguards.isParentSidebarItem(props)) {
    return <ParentSidebarItem {...props} />;
  }
  return (
    <GenericSidebarItem<IExpandedSidebarItem> {...props}>
      <span className={"text-container"}>{props.label}</span>
    </GenericSidebarItem>
  );
};

export default React.memo(ExpandedSidebarItem);

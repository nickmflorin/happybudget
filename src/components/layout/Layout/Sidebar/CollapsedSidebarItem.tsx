import React from "react";

import GenericSidebarItem from "./GenericSidebarItem";

const CollapsedSidebarItem = (props: ICollapsedSidebarItem): JSX.Element => {
  return <GenericSidebarItem<ICollapsedSidebarItem> {...props} />;
};

export default React.memo(CollapsedSidebarItem);

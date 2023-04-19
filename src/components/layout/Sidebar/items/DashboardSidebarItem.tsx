import { config } from "application";
import { ui } from "lib";

import GenericSidebarItem from "./GenericSidebarItem";
import ParentSidebarItem from "./ParentSidebarItem";

export const DashboardSidebarItem = (
  props: IExpandedSidebarItem &
    StandardComponentProps & { readonly closeSidebarOnClick?: () => void },
): JSX.Element => {
  if (ui.layout.isParentSidebarItem(props)) {
    return <ParentSidebarItem {...props} />;
  }
  return (
    <GenericSidebarItem<IExpandedSidebarItem> {...props}>
      <span className="text-container">{props.label}</span>
    </GenericSidebarItem>
  );
};

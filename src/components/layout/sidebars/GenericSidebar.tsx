import React from "react";

import classNames from "classnames";
import { map } from "lodash";

import { ShowHide } from "components";

export interface GenericSidebarProps<I extends ISidebarItem>
  extends StandardComponentWithChildrenProps {
  readonly sidebar: I[];
  readonly renderItem: (i: I) => JSX.Element;
}

const GenericSidebar = <I extends ISidebarItem>({
  sidebar,
  renderItem,
  children,
  ...props
}: GenericSidebarProps<I>): JSX.Element => (
  <div {...props} className={classNames("sidebar", props.className)}>
    {children}
    <ShowHide show={sidebar.length !== 0}>
      <div className="sidebar-menu">
        {map(sidebar, (item: I, i: number) => (
          <React.Fragment key={i}>{renderItem(item)}</React.Fragment>
        ))}
      </div>
    </ShowHide>
  </div>
);

export default React.memo(GenericSidebar) as typeof GenericSidebar;

import React from "react";
import classNames from "classnames";

import { ui } from "lib";

import { CollapsedSidebar } from "./Sidebar";
import GenericLayout, { GenericLayoutProps } from "./GenericLayout";
import { isNil } from "lodash";

export interface CollapsedLayoutProps extends Omit<GenericLayoutProps, "sidebar"> {
  readonly sidebar?: ICollapsedSidebarItem[];
}

const CollapsedLayout = (props: CollapsedLayoutProps): JSX.Element => {
  const layout = ui.hooks.useLayoutIfNotDefined(props.layout);

  return (
    <GenericLayout
      layout={layout}
      className={classNames("layout--collapsed", props.className)}
      style={props.style}
      sidebar={
        !isNil(props.sidebar) ? (
          <CollapsedSidebar sidebar={props.sidebar} toggle={() => layout.current.toggleSidebar()} />
        ) : undefined
      }
    >
      {props.children}
    </GenericLayout>
  );
};

export default React.memo(CollapsedLayout);

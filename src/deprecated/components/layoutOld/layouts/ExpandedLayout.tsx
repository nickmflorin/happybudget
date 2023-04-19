import React from "react";

import classNames from "classnames";

import { ui } from "lib";

import GenericLayout, { GenericLayoutProps } from "./GenericLayout";
import { ExpandedSidebar } from "../sidebars";

export interface ExpandedLayoutProps extends Omit<GenericLayoutProps, "sidebar"> {
  readonly sidebar: IExpandedSidebarItem[];
}

const ExpandedLayout = (props: ExpandedLayoutProps): JSX.Element => {
  const layout = ui.layout.useLayoutIfNotDefined(props.layout);

  return (
    <GenericLayout
      layout={layout}
      showHeaderSidebarToggle={true}
      className={classNames("layout--expanded", props.className)}
      style={props.style}
      sidebar={
        <ExpandedSidebar sidebar={props.sidebar} toggle={() => layout.current.toggleSidebar()} />
      }
    >
      {props.children}
    </GenericLayout>
  );
};

export default React.memo(ExpandedLayout);

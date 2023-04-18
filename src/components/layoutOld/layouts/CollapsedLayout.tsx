import React from "react";

import classNames from "classnames";
import { isNil } from "lodash";

import { ui } from "lib";

import GenericLayout, { GenericLayoutProps } from "./GenericLayout";
import { CollapsedSidebar } from "../sidebars";

export type CollapsedLayoutProps = Omit<GenericLayoutProps, "sidebar"> & {
  readonly sidebar?: ICollapsedSidebarItem[];
};

const CollapsedLayout = (props: CollapsedLayoutProps): JSX.Element => {
  const layout = ui.layout.useLayoutIfNotDefined(props.layout);

  return (
    <GenericLayout
      {...props}
      layout={layout}
      className={classNames("layout--collapsed", props.className)}
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

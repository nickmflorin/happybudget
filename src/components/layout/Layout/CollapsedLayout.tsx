import classNames from "classnames";

import { ui } from "lib";

import { CollapsedSidebar } from "./Sidebar";
import GenericLayout, { GenericLayoutProps } from "./GenericLayout";

export interface CollapsedLayoutProps extends Omit<GenericLayoutProps, "sidebar"> {
  readonly sidebar: ICollapsedSidebarItem[];
}

const CollapsedLayout = (props: CollapsedLayoutProps): JSX.Element => {
  const isMobile = ui.hooks.useLessThanBreakpoint("medium");
  const layout = ui.hooks.useLayoutIfNotDefined(props.layout);

  return (
    <GenericLayout
      layout={layout}
      className={classNames("layout--collapsed", props.className)}
      style={props.style}
      sidebar={
        <CollapsedSidebar
          sidebar={props.sidebar}
          toggle={() => layout.current.toggleSidebar()}
          closeOnClick={isMobile ? () => layout.current.setSidebarVisible(false) : undefined}
        />
      }
    >
      {props.children}
    </GenericLayout>
  );
};

export default CollapsedLayout;

import classNames from "classnames";

import { ui } from "lib";

import { ExpandedSidebar } from "./Sidebar";
import GenericLayout, { GenericLayoutProps } from "./GenericLayout";

export interface ExpandedLayoutProps extends Omit<GenericLayoutProps, "sidebar"> {
  readonly sidebar: IExpandedSidebarItem[];
}

const ExpandedLayout = (props: ExpandedLayoutProps): JSX.Element => {
  const isMobile = ui.hooks.useLessThanBreakpoint("medium");
  const layout = ui.hooks.useLayoutIfNotDefined(props.layout);

  return (
    <GenericLayout
      layout={layout}
      showHeaderSidebarToggle={true}
      className={classNames("layout--expanded", props.className)}
      style={props.style}
      sidebar={
        <ExpandedSidebar
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

export default ExpandedLayout;

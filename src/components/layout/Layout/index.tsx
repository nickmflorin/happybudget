import { useState, useMemo, useEffect } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { hooks } from "lib";

import Content from "./Content";
import Header, { HeaderProps } from "./Header";
import Sidebar, { SidebarProps } from "./Sidebar";

export interface LayoutProps extends Omit<HeaderProps & SidebarProps, "sidebarVisible" | "toggleSidebar"> {
  readonly children: JSX.Element;
  readonly headerProps?: StandardComponentProps;
  readonly contentProps?: StandardComponentProps;
}

const Layout = (props: LayoutProps): JSX.Element => {
  const isMobile = hooks.useLessThanBreakpoint("medium");
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    // We want to hide the sidebar by default on mobile devices but show it by default on larger devices.
    setSidebarVisible(!isMobile);
  }, [isMobile]);

  const layoutClassNameProps = useMemo<LayoutClassNameParams>(
    (): LayoutClassNameParams => ({
      "collapsed-layout": props.collapsed,
      "expanded-layout": !props.collapsed,
      "sidebar-visible": sidebarVisible,
      "sidebar-hidden": !sidebarVisible
    }),
    [props.collapsed, sidebarVisible]
  );

  return (
    <div className={classNames("layout", props.className, layoutClassNameProps)} style={props.style}>
      {!isNil(props.sidebar) && (
        <div className={classNames("sidebar-container", layoutClassNameProps)}>
          <Sidebar
            {...props}
            className={classNames(layoutClassNameProps)}
            sidebarVisible={sidebarVisible}
            toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
          />
        </div>
      )}
      <div className={classNames("layout-content", layoutClassNameProps)}>
        <Header
          {...props}
          {...props.headerProps}
          className={classNames(props.headerProps?.className, layoutClassNameProps)}
          sidebarVisible={sidebarVisible}
          toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        />
        <Content {...props.contentProps}>{props.children}</Content>
      </div>
    </div>
  );
};

export default Layout;

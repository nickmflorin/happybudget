import { useState, useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { hooks } from "lib";

import Content from "./Content";
import Header from "./Header";
import Sidebar, { ISidebarItem } from "./Sidebar";
import { IToolbarItem } from "./Header/Toolbar";
import { useEffect } from "react";

export interface LayoutProps {
  className?: string;
  children: any;
  sidebar?: ISidebarItem[] | (() => JSX.Element);
  toolbar?: IToolbarItem[] | (() => JSX.Element);
  style?: React.CSSProperties;
  collapsed?: boolean;
  headerProps?: StandardComponentProps;
  contentProps?: StandardComponentProps;
  showHeaderLogo?: boolean;
}

const Layout = ({
  className,
  children,
  toolbar,
  sidebar,
  style = {},
  collapsed = false,
  showHeaderLogo = false,
  headerProps = {},
  contentProps = {}
}: LayoutProps): JSX.Element => {
  const isMobile = hooks.useLessThanBreakpoint("medium");
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    // We want to hide the sidebar by default on mobile devices but show it by default on larger devices.
    setSidebarVisible(!isMobile);
  }, [isMobile]);

  const layoutClassNameProps = useMemo<LayoutClassNameParams>(
    (): LayoutClassNameParams => ({
      "collapsed-layout": collapsed,
      "expanded-layout": !collapsed,
      "sidebar-visible": sidebarVisible,
      "sidebar-hidden": !sidebarVisible
    }),
    [collapsed, sidebarVisible]
  );

  return (
    <div className={classNames("layout", className, layoutClassNameProps)} style={style}>
      {!isNil(sidebar) && (
        <div className={classNames("sidebar-container", layoutClassNameProps)}>
          {Array.isArray(sidebar) ? (
            <Sidebar
              className={classNames(layoutClassNameProps)}
              collapsed={collapsed}
              sidebarItems={sidebar as ISidebarItem[]}
              sidebarVisible={sidebarVisible}
              toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
            />
          ) : (
            sidebar()
          )}
        </div>
      )}
      <div className={classNames("layout-content", layoutClassNameProps)}>
        <Header
          toolbar={toolbar}
          {...headerProps}
          className={classNames(headerProps.className, layoutClassNameProps)}
          collapsed={collapsed}
          sidebarVisible={sidebarVisible}
          toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
          showHeaderLogo={showHeaderLogo}
        />
        <Content {...contentProps}>{children}</Content>
      </div>
    </div>
  );
};

export default Layout;

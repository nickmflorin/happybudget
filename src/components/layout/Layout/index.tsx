import { useState, useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import Content from "./Content";
import Header from "./Header";
import Sidebar, { ISidebarItem } from "./Sidebar";
import { IToolbarItem } from "./Header/Toolbar";

/* eslint-disable no-unused-vars */
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
  // The default header height is 70px.  But this only applies when there is
  // not a supplementary header below the default header.  To layout the component
  // hierarchy properly with scrolling and fixed headers, we need to programatically
  // adjust the height (so it can be dynamic, in the case of a supplementary header).
  // Example: headerHeight: 100 would refer to a situation in which the supplementary
  // header height is 30px.
  headerHeight?: number;
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
  headerHeight,
  contentProps = {}
}: LayoutProps): JSX.Element => {
  const [sidebarVisible, setSidebarVisible] = useState(false);

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
          headerHeight={headerHeight}
          toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
          showHeaderLogo={showHeaderLogo}
        />
        <Content {...contentProps}>{children}</Content>
      </div>
    </div>
  );
};

export default Layout;

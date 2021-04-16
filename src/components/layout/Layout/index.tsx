import { ReactNode } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { ShowHide } from "components";

import Content from "./Content";
import Header from "./Header";
import Footer from "./Footer";
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
  breadcrumbs?: ReactNode;
  headerProps?: StandardComponentProps;
  contentProps?: StandardComponentProps;
  includeFooter?: boolean;
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
  breadcrumbs,
  sidebar,
  style = {},
  collapsed = false,
  includeFooter = true,
  headerProps = {},
  headerHeight,
  contentProps = {}
}: LayoutProps): JSX.Element => {
  return (
    <div className={classNames("application", className)} style={style}>
      {!isNil(sidebar) && (
        <div className={classNames("sidebar-container", { collapsed })}>
          {Array.isArray(sidebar) ? (
            <Sidebar collapsed={collapsed} sidebarItems={sidebar as ISidebarItem[]} />
          ) : (
            sidebar()
          )}
        </div>
      )}
      <div className={classNames("application-content", { collapsed })}>
        <Header breadcrumbs={breadcrumbs} toolbar={toolbar} {...headerProps} headerHeight={headerHeight} />
        <Content {...contentProps}>{children}</Content>
        <ShowHide show={includeFooter}>
          <Footer />
        </ShowHide>
      </div>
    </div>
  );
};

export default Layout;

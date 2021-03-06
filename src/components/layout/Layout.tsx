import { ReactNode } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import Header from "./Header";
import Footer from "./Footer";
import Sidebar, { ISidebarItem } from "./Sidebar";
import { IToolbarItem } from "./Toolbar";

interface LayoutProps {
  className?: string;
  children: any;
  sidebar?: ISidebarItem[] | (() => JSX.Element);
  toolbar?: IToolbarItem[] | (() => JSX.Element);
  style?: React.CSSProperties;
  collapsed?: boolean;
  breadcrumbs?: ReactNode;
}

const Layout = ({
  className,
  children,
  toolbar,
  breadcrumbs,
  sidebar,
  style = {},
  collapsed = false
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
        <Header breadcrumbs={breadcrumbs} toolbar={toolbar} />
        <div className={"content"}>{children}</div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;

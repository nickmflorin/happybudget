import classNames from "classnames";
import { isNil } from "lodash";

import Header from "./Header";
import Footer from "./Footer";
import Sidebar, { ISidebarItem } from "./Sidebar";

interface LayoutProps {
  className?: string;
  children: any;
  sidebar?: ISidebarItem[] | (() => JSX.Element);
  style?: React.CSSProperties;
  collapsed?: boolean;
}

const Layout = ({ className, children, sidebar, style = {}, collapsed = false }: LayoutProps): JSX.Element => {
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
        <Header />
        <div className={"content"}>{children}</div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;

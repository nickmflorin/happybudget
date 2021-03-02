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
}

const Layout = ({ className, children, sidebar, style = {} }: LayoutProps): JSX.Element => {
  return (
    <div className={classNames("application", className)} style={style}>
      {!isNil(sidebar) && (
        <div className={"sidebar-container"}>
          {Array.isArray(sidebar) ? <Sidebar sidebarItems={sidebar as ISidebarItem[]} /> : sidebar()}
        </div>
      )}
      <div className={classNames("application-content", { "with-sidebar": !isNil(sidebar) })}>
        <Header />
        <div className={"content"}>{children}</div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;

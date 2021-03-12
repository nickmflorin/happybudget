import { ReactNode, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import classNames from "classnames";
import { isNil } from "lodash";

import { setDrawerVisibilityAction } from "store/actions";

import Header from "./Header";
import Footer from "./Footer";
import Sidebar, { ISidebarItem } from "./Sidebar";
import { IToolbarItem } from "./Header/Toolbar";

/* eslint-disable no-unused-vars */
interface LayoutProps<D extends string = string> {
  className?: string;
  children: any;
  sidebar?: ISidebarItem[] | (() => JSX.Element);
  toolbar?: IToolbarItem[] | (() => JSX.Element);
  style?: React.CSSProperties;
  collapsed?: boolean;
  breadcrumbs?: ReactNode;
  drawers?: { [key in D]: (() => JSX.Element) | JSX.Element };
  visibleDrawer?: D | undefined;
}

const Layout = <D extends string = string>({
  className,
  children,
  toolbar,
  breadcrumbs,
  sidebar,
  style = {},
  collapsed = false,
  drawers,
  visibleDrawer
}: LayoutProps<D>): JSX.Element => {
  const [drawer, setDrawer] = useState<JSX.Element | undefined>(undefined);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isNil(drawers) && !isNil(visibleDrawer) && !isNil(drawers[visibleDrawer])) {
      const d: (() => JSX.Element) | JSX.Element = drawers[visibleDrawer];
      dispatch(setDrawerVisibilityAction(true));
      if (typeof d === "function") {
        setDrawer(d());
      } else {
        setDrawer(d);
      }
    } else {
      dispatch(setDrawerVisibilityAction(false));
      setDrawer(undefined);
    }
  }, [drawers, visibleDrawer]);

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
        <div className={"content"}>
          <div className={"content-left"}>{children}</div>
          <div className={"content-right"}>{!isNil(drawer) && drawer}</div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;

import { Link } from "react-router-dom";
import { map } from "lodash";
import classNames from "classnames";

import { ShowHide } from "components";
import { SidebarLogo, LeafLogo } from "components/svgs";

import SidebarItem, { ISidebarItem } from "./SidebarItem";
import "./index.scss";

export * from "./SidebarItem";

export interface ISidebarDropdownItem {
  icon?: JSX.Element;
  text: string;
  onClick: () => void;
}

interface SidebarProps {
  sidebarItems?: ISidebarItem[];
  collapsed?: boolean;
}

const Sidebar = ({ sidebarItems = [], collapsed = false }: SidebarProps): JSX.Element => {
  return (
    <div className={classNames("sidebar", { collapsed })}>
      <div className={"logo-container"}>
        <Link className={"logo-link"} to={"/"}>
          <ShowHide show={collapsed}>
            <LeafLogo />
          </ShowHide>
          <ShowHide show={!collapsed}>
            <SidebarLogo />
          </ShowHide>
        </Link>
      </div>
      <ShowHide show={sidebarItems.length !== 0}>
        <div className={"sidebar-menu"}>
          {map(sidebarItems.slice(0, sidebarItems.length / 2), (item: ISidebarItem, index: number) => (
            <SidebarItem key={index} collapsed={collapsed} {...item} />
          ))}
          <hr></hr>
          {map(
            sidebarItems.slice(sidebarItems.length / 2, sidebarItems.length),
            (item: ISidebarItem, index: number) => (
              <SidebarItem key={index} collapsed={collapsed} {...item} />
            )
          )}
        </div>
      </ShowHide>
    </div>
  );
};

export default Sidebar;

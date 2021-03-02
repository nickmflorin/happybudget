import { isNil, map, filter } from "lodash";
import classNames from "classnames";
import { Link } from "react-router-dom";

import { ShowHide } from "components/display";
import { SidebarLogo } from "components/display/svgs";

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
}

const Sidebar = ({ sidebarItems = [] }: SidebarProps): JSX.Element => {
  return (
    <div className={"sidebar"}>
      <div className={"logo-container"}>
        <Link className={"logo-link"} to={"/"}>
          <SidebarLogo />
        </Link>
      </div>
      <ShowHide show={sidebarItems.length !== 0}>
        <div
          className={classNames("sidebar-menu", {
            "space-for-caret": filter(sidebarItems, (it: ISidebarItem) => !isNil(it.children)).length !== 0
          })}
        >
          {map(sidebarItems, (item: ISidebarItem, index: number) => (
            <SidebarItem
              key={index}
              siblingWithCaret={
                filter(sidebarItems, (it: ISidebarItem) => it !== item && !isNil(it.children)).length !== 0
              }
              {...item}
            />
          ))}
        </div>
      </ShowHide>
    </div>
  );
};

export default Sidebar;

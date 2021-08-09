import { Link } from "react-router-dom";
import { map } from "lodash";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/pro-light-svg-icons";

import { ShowHide } from "components";
import { IconButton } from "components/buttons";
import { SidebarLogo, LeafLogo } from "components/svgs";

import SidebarItem, { ISidebarItem } from "./SidebarItem";
import "./index.scss";

export * from "./SidebarItem";

export interface ISidebarDropdownItem {
  icon?: JSX.Element;
  text: string;
  onClick: () => void;
}

interface SidebarProps extends StandardComponentProps {
  readonly sidebarItems?: ISidebarItem[];
  readonly collapsed?: boolean;
  readonly toggleSidebar: () => void;
}

const Sidebar = ({ sidebarItems = [], collapsed = false, toggleSidebar, ...props }: SidebarProps): JSX.Element => {
  return (
    <div {...props} className={classNames("sidebar", props.className)}>
      <IconButton
        className={"btn--sidebar-close"}
        size={"large"}
        icon={<FontAwesomeIcon icon={faTimes} />}
        onClick={() => toggleSidebar()}
      />
      <ShowHide show={collapsed}>
        <div className={"sidebar-toggle-btn-container"}>
          <IconButton
            className={"btn--sidebar-sidebar-toggle"}
            size={"large"}
            icon={<FontAwesomeIcon icon={faBars} />}
            onClick={() => toggleSidebar?.()}
          />
        </div>
      </ShowHide>
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
          {map(sidebarItems, (item: ISidebarItem, index: number) => (
            <SidebarItem key={index} collapsed={collapsed} {...item} />
          ))}
        </div>
      </ShowHide>
    </div>
  );
};

export default Sidebar;

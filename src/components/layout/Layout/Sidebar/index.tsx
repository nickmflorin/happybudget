import { Link } from "react-router-dom";
import { map } from "lodash";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes, faArrowAltToLeft } from "@fortawesome/pro-light-svg-icons";

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
  readonly sidebarVisible: boolean;
  readonly toggleSidebar: () => void;
}

const Sidebar = ({
  sidebarItems = [],
  collapsed = false,
  sidebarVisible,
  toggleSidebar,
  ...props
}: SidebarProps): JSX.Element => {
  return (
    <div {...props} className={classNames("sidebar", props.className)}>
      <IconButton
        className={"btn--sidebar-close"}
        icon={<FontAwesomeIcon className={"icon"} icon={faTimes} />}
        onClick={() => toggleSidebar()}
      />
      <ShowHide show={collapsed}>
        <IconButton
          className={"btn--sidebar-toggle"}
          icon={(params: ClickableIconCallbackParams) => {
            if (sidebarVisible === true && params.isHovered === true) {
              return <FontAwesomeIcon icon={faArrowAltToLeft} className={"icon icon--green"} />;
            } else {
              return <FontAwesomeIcon icon={faBars} className={"icon"} />;
            }
          }}
          onClick={() => toggleSidebar()}
        />
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

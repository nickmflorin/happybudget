import React from "react";
import { Link } from "react-router-dom";
import { map } from "lodash";
import classNames from "classnames";

import { Icon, ShowHide } from "components";
import { IconButton } from "components/buttons";
import { SidebarLogo, LeafLogo } from "components/svgs";

import SidebarItem from "./SidebarItem";
import "./index.scss";

export * from "./SidebarItem";

export interface SidebarProps extends StandardComponentProps {
  readonly sidebar?: ISidebarItem[];
  readonly collapsed?: boolean;
  readonly sidebarVisible: boolean;
  readonly toggleSidebar: () => void;
}

const Sidebar = ({
  sidebar = [],
  collapsed = false,
  sidebarVisible,
  toggleSidebar,
  ...props
}: SidebarProps): JSX.Element => {
  return (
    <div {...props} className={classNames("sidebar", props.className)}>
      <IconButton
        className={"btn--sidebar-close"}
        icon={<Icon icon={"times"} weight={"light"} />}
        onClick={() => toggleSidebar()}
      />
      <ShowHide show={collapsed}>
        <IconButton
          className={"btn--sidebar-toggle"}
          icon={(params: ClickableIconCallbackParams) => {
            if (sidebarVisible === true && params.isHovered === true) {
              return <Icon icon={"arrow-alt-to-left"} green={true} weight={"light"} />;
            } else {
              return <Icon icon={"bars"} weight={"light"} />;
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
      <ShowHide show={sidebar.length !== 0}>
        <div className={"sidebar-menu"}>
          {map(sidebar, (item: ISidebarItem, index: number) => (
            <SidebarItem key={index} collapsed={collapsed} {...item} />
          ))}
        </div>
      </ShowHide>
    </div>
  );
};

export default React.memo(Sidebar);

import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";

import { ui } from "lib";

import { Icon, ShowHide } from "components";
import { IconButton } from "components/buttons";
import { SidebarLogo } from "components/svgs";

import GenericSidebar, { GenericSidebarProps } from "./GenericSidebar";
import ExpandedSidebarItem from "./ExpandedSidebarItem";
import "./index.scss";

export interface ExpandedSidebarProps
  extends Omit<GenericSidebarProps<IExpandedSidebarItem>, "renderItem" | "children"> {
  readonly closeOnClick?: () => void;
  readonly toggle: () => void;
}

const ExpandedSidebar = ({ closeOnClick, toggle, ...props }: ExpandedSidebarProps): JSX.Element => {
  const isMobile = ui.hooks.useLessThanBreakpoint("medium");

  return (
    <GenericSidebar<IExpandedSidebarItem>
      {...props}
      className={classNames("sidebar--expanded", props.className)}
      renderItem={(item: IExpandedSidebarItem) => <ExpandedSidebarItem {...item} />}
    >
      <ShowHide show={isMobile}>
        <IconButton
          className={"btn--sidebar-close"}
          icon={<Icon icon={"times"} weight={"light"} />}
          onClick={() => toggle()}
        />
      </ShowHide>
      <div className={"logo-container"}>
        <Link className={"logo-link"} to={"/"}>
          <SidebarLogo />
        </Link>
      </div>
    </GenericSidebar>
  );
};

export default React.memo(ExpandedSidebar);

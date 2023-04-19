import React from "react";

import classNames from "classnames";
import { Link } from "react-router-dom";

import { ui } from "lib";
import { Icon, ShowHide } from "components";
import { IconButton } from "components/buttonsOld";
import { GreenbudgetTextLogo } from "deprecated/components/svgs";

import ExpandedSidebarItem from "./ExpandedSidebarItem";
import GenericSidebar, { GenericSidebarProps } from "./GenericSidebar";

export interface ExpandedSidebarProps
  extends Omit<GenericSidebarProps<IExpandedSidebarItem>, "renderItem" | "children"> {
  readonly toggle: () => void;
}

const ExpandedSidebar = ({ toggle, ...props }: ExpandedSidebarProps): JSX.Element => {
  const isMobile = ui.useLessThanBreakpoint("medium");

  return (
    <GenericSidebar<IExpandedSidebarItem>
      {...props}
      className={classNames("sidebar--expanded", props.className)}
      renderItem={(item: IExpandedSidebarItem) => (
        <ExpandedSidebarItem {...item} closeSidebarOnClick={isMobile ? toggle : undefined} />
      )}
    >
      <ShowHide show={isMobile}>
        <IconButton
          className="btn--sidebar-close"
          icon={<Icon icon="times" weight="light" />}
          onClick={() => toggle()}
        />
      </ShowHide>
      <div className="logo-container">
        <Link className="logo-link" to="/">
          <GreenbudgetTextLogo />
        </Link>
      </div>
    </GenericSidebar>
  );
};

export default React.memo(ExpandedSidebar);

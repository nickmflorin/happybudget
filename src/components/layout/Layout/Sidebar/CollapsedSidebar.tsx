import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";

import { Icon } from "components";
import { IconButton } from "components/buttons";
import { LeafLogo } from "components/svgs";

import GenericSidebar, { GenericSidebarProps } from "./GenericSidebar";
import GenericSidebarItem from "./GenericSidebarItem";

import "./index.scss";

export interface CollapsedSidebarProps
  extends Omit<GenericSidebarProps<ICollapsedSidebarItem>, "renderItem" | "children"> {
  readonly closeOnClick?: () => void;
  readonly toggle: () => void;
}

const CollapsedSidebar = ({ closeOnClick, toggle, ...props }: CollapsedSidebarProps): JSX.Element => {
  return (
    <GenericSidebar<ICollapsedSidebarItem>
      {...props}
      className={classNames("sidebar--collapsed", props.className)}
      renderItem={(item: ICollapsedSidebarItem) => <GenericSidebarItem {...item} />}
    >
      <IconButton
        className={"btn--sidebar-toggle"}
        icon={(params: ClickableIconCallbackParams) => {
          if (params.isHovered === true) {
            return <Icon icon={"arrow-alt-to-left"} green={true} weight={"light"} />;
          } else {
            return <Icon icon={"bars"} weight={"light"} />;
          }
        }}
        onClick={() => toggle()}
      />
      <div className={"logo-container"}>
        <Link className={"logo-link"} to={"/"}>
          <LeafLogo />
        </Link>
      </div>
    </GenericSidebar>
  );
};

export default React.memo(CollapsedSidebar);

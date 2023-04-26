import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";

import * as store from "store";

import { Icon } from "components";
import { IconButton } from "components/buttons";
import { LeafLogo } from "components/svgs";

import GenericSidebar, { GenericSidebarProps } from "./GenericSidebar";
import GenericSidebarItem from "./GenericSidebarItem";

export interface CollapsedSidebarProps
  extends Omit<GenericSidebarProps<ICollapsedSidebarItem>, "renderItem" | "children"> {
  readonly toggle: () => void;
}

const CollapsedSidebar = ({ toggle, ...props }: CollapsedSidebarProps): JSX.Element => {
  const user = store.hooks.useUser();

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
            return <Icon icon={"arrow-alt-to-left"} green={true} weight={"solid"} />;
          } else {
            return <Icon icon={"bars"} weight={"solid"} />;
          }
        }}
        onClick={() => toggle()}
      />
      <div className={"logo-container"}>
        <Link className={"logo-link"} to={user === null ? "/login" : "/"}>
          <LeafLogo />
        </Link>
      </div>
    </GenericSidebar>
  );
};

export default CollapsedSidebar;

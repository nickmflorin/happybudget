import { useRouter } from "next/router";
import React from "react";

import classNames from "classnames";

import * as config from "config";
import { ui } from "lib";

import { CorshaLogo } from "components/icons";
import { Separator } from "components/structural";

import { SidebarRoutes } from "./SidebarRoutes";

export type SidebarProps = ui.ComponentProps<{
  style?: Omit<ui.Style, ui.CSSSizeProperties>;
}>;

export const Sidebar = (props: SidebarProps): JSX.Element => {
  const router = useRouter();
  return (
    <div {...props} className={classNames("sidebar", props.className)}>
      <div className="sidebar__corsha-logo-container">
        <CorshaLogo
          onClick={() => router.push(config.SidebarPages[config.SidebarPageIds.DASHBOARD].pathname)}
        />
      </div>
      <Separator className="separator--sidebar" />
      <SidebarRoutes location={config.SidebarPageLocations.CENTER} router={router} />
      <SidebarRoutes location={config.SidebarPageLocations.BOTTOM} router={router} />
    </div>
  );
};

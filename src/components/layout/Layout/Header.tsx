import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";

import { Layout } from "antd";

import { users } from "lib";

import { Icon, ShowHide } from "components";
import { IconButton } from "components/buttons";
import { HelpDropdownMenu, UserDropdownMenu } from "components/dropdowns";
import { IsAuthenticated } from "components/permissions";
import { GreenbudgetTextLogo, LeafLogo } from "components/svgs";

export type HeaderProps = StandardComponentProps & {
  readonly showSidebarToggle?: boolean | undefined;
  readonly showTextLogo?: boolean | undefined;
  readonly showLeafLogo?: boolean | undefined;
  readonly sidebarVisible: boolean;
  readonly toggleSidebar: () => void;
};

const Header = ({
  sidebarVisible,
  toggleSidebar,
  showTextLogo,
  showSidebarToggle,
  showLeafLogo,
  ...props
}: HeaderProps): JSX.Element => {
  const user = users.hooks.useUser();

  return (
    <Layout.Header
      {...props}
      className={classNames("header", props.className, {
        "with-text-logo": showTextLogo
      })}
    >
      <div className={"primary-header"}>
        <div className={"primary-header-left"}>
          <ShowHide show={showSidebarToggle}>
            <IconButton
              className={"btn--sidebar-toggle"}
              iconSize={"standard"}
              size={"large"}
              icon={(params: ClickableIconCallbackParams) => {
                if (sidebarVisible === true && params.isHovered === true) {
                  return <Icon icon={"arrow-alt-to-left"} weight={"light"} green={true} />;
                } else if (params.isHovered === true) {
                  return <Icon icon={"arrow-alt-to-right"} weight={"light"} green={true} />;
                } else {
                  return <Icon icon={"bars"} weight={"light"} />;
                }
              }}
              onClick={() => toggleSidebar()}
            />
          </ShowHide>
          <ShowHide show={showLeafLogo}>
            <Link className={"leaf-logo-link"} to={user === null ? "/login" : "/"}>
              <LeafLogo />
            </Link>
          </ShowHide>
          <div id={"breadcrumbs"}></div>
        </div>

        <ShowHide show={showTextLogo}>
          <div className={"primary-header-center"}>
            <Link className={"logo-link"} to={"/"}>
              <GreenbudgetTextLogo />
            </Link>
          </div>
        </ShowHide>

        <IsAuthenticated>
          <div className={"primary-header-right"}>
            <div id={"saving-changes"}></div>
            <HelpDropdownMenu />
            <UserDropdownMenu />
          </div>
        </IsAuthenticated>
      </div>
      <div id={"supplementary-header"}></div>
    </Layout.Header>
  );
};

export default React.memo(Header);

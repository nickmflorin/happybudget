import React from "react";
import { useHistory, Link } from "react-router-dom";
import classNames from "classnames";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faArrowAltToLeft,
  faArrowAltToRight,
  faSignOutAlt,
  faAddressCard,
  faLock
} from "@fortawesome/pro-light-svg-icons";

import { Layout } from "antd";

import { Dropdown, VerticalFlexCenter, ShowHide } from "components";
import { IconButton } from "components/buttons";
import { SidebarLogo } from "components/svgs";
import { AccountCircleLink } from "components/links";
import { useLoggedInUser } from "store/hooks";

import Toolbar, { IToolbarItem } from "./Toolbar";

import "./index.scss";

interface HeaderProps extends StandardComponentProps {
  readonly toolbar?: IToolbarItem[] | (() => JSX.Element);
  readonly sidebarVisible: boolean;
  readonly collapsed: boolean;
  readonly toggleSidebar: () => void;
  readonly showHeaderLogo?: boolean;
}

const Header = ({
  toolbar,
  sidebarVisible,
  collapsed,
  toggleSidebar,
  showHeaderLogo,
  ...props
}: HeaderProps): JSX.Element => {
  const user = useLoggedInUser();
  const history = useHistory();

  return (
    <Layout.Header {...props} className={classNames("header", props.className)}>
      <div className={"primary-header"}>
        <div className={"primary-header-left"}>
          {/* In the case that we are not using a collapsed layout, we always show the
          sidebar toggle button - the only exception is cases where the screen is very
          large and we do not allow the sidebar to be toggled, but in those cases this
          button is hidden with media queries. */}
          <ShowHide show={!sidebarVisible || collapsed === false}>
            <IconButton
              className={"btn--sidebar-toggle"}
              icon={(params: ClickableIconCallbackParams) => {
                if (sidebarVisible === true && params.isHovered === true) {
                  return <FontAwesomeIcon icon={faArrowAltToLeft} className={"icon icon--green"} />;
                } else if (params.isHovered === true) {
                  return <FontAwesomeIcon icon={faArrowAltToRight} className={"icon icon--green"} />;
                } else {
                  return <FontAwesomeIcon icon={faBars} className={"icon"} />;
                }
              }}
              onClick={() => toggleSidebar()}
            />
          </ShowHide>
          <div id={"breadcrumbs"}></div>
        </div>

        <div className={"primary-header-center"}>
          <ShowHide show={showHeaderLogo}>
            <Link className={"logo-link"} to={"/"}>
              <SidebarLogo />
            </Link>
          </ShowHide>
        </div>

        <div className={"primary-header-right"}>
          {!isNil(toolbar) &&
            (Array.isArray(toolbar) ? (
              <Toolbar items={toolbar as IToolbarItem[]} />
            ) : (
              <VerticalFlexCenter>{toolbar()}</VerticalFlexCenter>
            ))}
          <Dropdown
            className={"header-dropdown"}
            menuProps={{ className: "header-dropdown-menu" }}
            trigger={["click"]}
            items={[
              {
                id: "profile",
                text: "Profile",
                onClick: () => history.push("/profile"),
                icon: <FontAwesomeIcon className={"icon"} icon={faAddressCard} />
              },
              {
                id: "admin",
                text: "Admin",
                onClick: () => {
                  window.location.href = `${process.env.REACT_APP_API_DOMAIN}/admin`;
                },
                icon: <FontAwesomeIcon className={"icon"} icon={faLock} />,
                visible: user.is_staff === true
              },
              {
                id: "logout",
                text: "Logout",
                onClick: () => history.push("/logout"),
                icon: <FontAwesomeIcon className={"icon"} icon={faSignOutAlt} />
              }
            ]}
          >
            <AccountCircleLink user={user} />
          </Dropdown>
        </div>
      </div>
      <div id={"supplementary-header"}></div>
    </Layout.Header>
  );
};

export default React.memo(Header);

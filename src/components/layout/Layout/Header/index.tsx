import React, { useMemo } from "react";
import { useHistory } from "react-router-dom";
import classNames from "classnames";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faSignOutAlt, faAddressCard, faLock } from "@fortawesome/pro-light-svg-icons";

import { Layout } from "antd";

import { Dropdown, VerticalFlexCenter, ShowHide } from "components";
import { IconButton } from "components/buttons";
import { AccountCircleLink } from "components/links";
import { useLoggedInUser } from "store/hooks";

import Toolbar, { IToolbarItem } from "./Toolbar";

import "./index.scss";

interface HeaderProps extends StandardComponentProps {
  readonly toolbar?: IToolbarItem[] | (() => JSX.Element);
  readonly sidebarVisible: boolean;
  // The default header height is 70px.  But this only applies when there is
  // not a supplementary header below the default header.  To layout the component
  // hierarchy properly with scrolling and fixed headers, we need to programatically
  // adjust the height (so it can be dynamic, in the case of a supplementary header).
  // Example: headerHeight: 100 would refer to a situation in which the supplementary
  // header height is 30px.
  readonly collapsed: boolean;
  readonly headerHeight?: number;
  readonly toggleSidebar: () => void;
}

const Header = ({
  toolbar,
  className,
  headerHeight,
  sidebarVisible,
  collapsed,
  toggleSidebar,
  style = {}
}: HeaderProps): JSX.Element => {
  const user = useLoggedInUser();
  const history = useHistory();

  const headerStyle = useMemo((): React.CSSProperties => {
    if (!isNil(headerHeight)) {
      style.height = headerHeight;
    }
    return style;
  }, [headerHeight, style]);

  return (
    <Layout.Header className={classNames("header", className)} style={headerStyle}>
      <div className={"primary-header"}>
        {/* In the case that we are not using a collapsed layout, we always show the
        sidebar toggle button - the only exception is cases where the screen is very
        large and we do not allow the sidebar to be toggled, but in those cases this
        button is hidden with media queries. */}
        <ShowHide show={!sidebarVisible || collapsed === false}>
          <IconButton
            className={"btn--header-sidebar-toggle"}
            size={"large"}
            icon={<FontAwesomeIcon icon={faBars} />}
            onClick={() => toggleSidebar()}
          />
        </ShowHide>
        <div className={"breadcrumb-wrapper"}>
          <div id={"breadcrumbs"}></div>
        </div>
        <div className={"toolbar-wrapper"}>
          {!isNil(toolbar) &&
            (Array.isArray(toolbar) ? (
              <Toolbar items={toolbar as IToolbarItem[]} />
            ) : (
              <VerticalFlexCenter>{toolbar()}</VerticalFlexCenter>
            ))}
        </div>
        <Dropdown
          className={"header-dropdown"}
          menuProps={{ className: "header-dropdown-menu" }}
          trigger={["click"]}
          items={[
            {
              id: "profile",
              text: "Profile",
              onClick: () => history.push("/profile"),
              icon: <FontAwesomeIcon icon={faAddressCard} />
            },
            {
              id: "admin",
              text: "Admin",
              onClick: () => {
                window.location.href = `${process.env.REACT_APP_API_DOMAIN}/admin`;
              },
              icon: <FontAwesomeIcon icon={faLock} />,
              visible: user.is_staff === true
            },
            {
              id: "logout",
              text: "Logout",
              onClick: () => history.push("/logout"),
              icon: <FontAwesomeIcon icon={faSignOutAlt} />
            }
          ]}
        >
          <div className={"account-wrapper"}>
            <AccountCircleLink user={user} />
          </div>
        </Dropdown>
      </div>
      <div id={"supplementary-header"}></div>
    </Layout.Header>
  );
};

export default Header;

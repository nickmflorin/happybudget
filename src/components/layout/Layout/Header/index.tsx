import React, { useMemo } from "react";
import { useHistory } from "react-router-dom";
import classNames from "classnames";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faAddressCard, faLock } from "@fortawesome/pro-light-svg-icons";

import { Layout } from "antd";

import { Dropdown, VerticalFlexCenter } from "components";
import { AccountCircleLink } from "components/links";
import { useLoggedInUser } from "store/hooks";

import Toolbar, { IToolbarItem } from "./Toolbar";

import "./index.scss";

interface HeaderProps extends StandardComponentProps {
  toolbar?: IToolbarItem[] | (() => JSX.Element);
  // The default header height is 70px.  But this only applies when there is
  // not a supplementary header below the default header.  To layout the component
  // hierarchy properly with scrolling and fixed headers, we need to programatically
  // adjust the height (so it can be dynamic, in the case of a supplementary header).
  // Example: headerHeight: 100 would refer to a situation in which the supplementary
  // header height is 30px.
  headerHeight?: number;
}

const Header = ({ toolbar, className, headerHeight, style = {} }: HeaderProps): JSX.Element => {
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

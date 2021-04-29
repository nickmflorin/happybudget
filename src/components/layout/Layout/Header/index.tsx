import React, { ReactNode, useMemo } from "react";
import { useHistory } from "react-router-dom";
import classNames from "classnames";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faAddressCard } from "@fortawesome/pro-light-svg-icons";

import { Layout, Tooltip } from "antd";

import { Dropdown } from "components";
import { AccountCircleLink } from "components/links";
import { ShowHide } from "components";
import { useLoggedInUser } from "store/hooks";

import Toolbar, { IToolbarItem } from "./Toolbar";

import "./index.scss";

interface HeaderProps extends StandardComponentProps {
  toolbar?: IToolbarItem[] | (() => JSX.Element);
  breadcrumbs?: ReactNode;
  // The default header height is 70px.  But this only applies when there is
  // not a supplementary header below the default header.  To layout the component
  // hierarchy properly with scrolling and fixed headers, we need to programatically
  // adjust the height (so it can be dynamic, in the case of a supplementary header).
  // Example: headerHeight: 100 would refer to a situation in which the supplementary
  // header height is 30px.
  headerHeight?: number;
}

const Header = ({ breadcrumbs, toolbar, className, headerHeight, style = {} }: HeaderProps): JSX.Element => {
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
          <ShowHide show={!isNil(breadcrumbs)}>{breadcrumbs}</ShowHide>
        </div>
        <div className={"toolbar-wrapper"}>
          {!isNil(toolbar) && (Array.isArray(toolbar) ? <Toolbar items={toolbar as IToolbarItem[]} /> : toolbar())}
        </div>
        <Dropdown
          className={"header-dropdown"}
          menuProps={{ className: "header-dropdown-menu" }}
          trigger={["click"]}
          items={[
            {
              text: "Profile",
              onClick: () => history.push("/profile"),
              icon: <FontAwesomeIcon icon={faAddressCard} />
            },
            { text: "Logout", onClick: () => history.push("/logout"), icon: <FontAwesomeIcon icon={faSignOutAlt} /> }
          ]}
        >
          <div className={"account-wrapper"}>
            <Tooltip title={user.username}>
              <AccountCircleLink user={user} />
            </Tooltip>
          </div>
        </Dropdown>
      </div>
      <div id={"supplementary-header"}></div>
    </Layout.Header>
  );
};

export default Header;

import React, { useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import classNames from "classnames";
import { isNil } from "lodash";

import { Layout } from "antd";

import { Icon, Dropdown, ShowHide, SavingChanges } from "components";
import { IconButton } from "components/buttons";
import { SidebarLogo } from "components/svgs";
import { AccountCircleLink } from "components/links";
import { useLoggedInUser } from "store/hooks";

import "./index.scss";

const APP_ID = process.env.REACT_APP_CANNY_APP_ID;
export interface HeaderProps extends StandardComponentProps {
  readonly sidebarVisible: boolean;
  readonly collapsed?: boolean | undefined;
  readonly showHeaderLogo?: boolean | undefined;
  readonly saving?: boolean;
  readonly toggleSidebar: () => void;
}

const Header = ({
  sidebarVisible,
  collapsed,
  toggleSidebar,
  showHeaderLogo,
  saving,
  ...props
}: HeaderProps): JSX.Element => {
  const user = useLoggedInUser();
  const history = useHistory();

  // https://developers.canny.io/install
  // When a user clicks the "Feedback" link in the profile image
  // dropdown menu they will be redirected to and authenticated in
  // Canny. This allows them to leave feedback without having to sign up.
  // Their feedback will be tied to their existing user account in your application.
  useEffect(() => {
    window.Canny("identify", {
      appID: APP_ID,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        avatarURL: user.profile_image?.url,
        created: new Date(user.created_at).toISOString()
      }
    });
  }, [user]);

  return (
    <Layout.Header
      {...props}
      className={classNames("header", props.className, {
        "with-logo": showHeaderLogo,
        "with-saving-changes": saving !== undefined
      })}
    >
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
          <div id={"breadcrumbs"}></div>
        </div>

        <div className={"primary-header-center"}>
          <Link className={"logo-link"} to={"/"}>
            <SidebarLogo />
          </Link>
        </div>

        <div className={"primary-header-right"}>
          <div id={"saving-changes"}>{!isNil(saving) && <SavingChanges saving={saving} />}</div>
          <Dropdown
            className={"header-dropdown"}
            menuProps={{ className: "header-dropdown-menu" }}
            trigger={["click"]}
            menuItems={[
              {
                id: "profile",
                label: "Profile",
                onClick: () => history.push("/profile"),
                icon: <Icon icon={"address-card"} weight={"light"} />
              },
              {
                id: "admin",
                label: "Admin",
                onClick: () => {
                  window.location.href = `${process.env.REACT_APP_API_DOMAIN}/admin`;
                },
                icon: <Icon icon={"lock"} weight={"light"} />,
                visible: user.is_staff === true
              },
              {
                id: "feedback",
                label: "Feedback",
                onClick: () => {
                  window.location.href = "https://saturation.canny.io/greenbudget";
                },
                icon: <Icon icon={"bullhorn"} weight={"light"} />
              },
              {
                id: "logout",
                label: "Logout",
                onClick: () => history.push("/logout"),
                icon: <Icon icon={"sign-out"} weight={"light"} />
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

import React from "react";
import { useHistory, Link } from "react-router-dom";
import classNames from "classnames";
import { isNil } from "lodash";

import { Layout } from "antd";

import { Icon, ShowHide, SavingChanges } from "components";
import { IconButton } from "components/buttons";
import { DropdownMenu } from "components/dropdowns";
import { SidebarLogo } from "components/svgs";
import { AccountCircleLink } from "components/links";
import { useLoggedInUser } from "store/hooks";

import HelpLink from "./HelpLink";

import "./index.scss";

export interface HeaderProps extends StandardComponentProps {
  readonly showHeaderSidebarToggle?: boolean | undefined;
  readonly showHeaderLogo?: boolean | undefined;
  readonly saving?: boolean;
  readonly sidebarVisible: boolean;
  readonly toggleSidebar: () => void;
}

const Header = ({
  sidebarVisible,
  toggleSidebar,
  showHeaderLogo,
  showHeaderSidebarToggle,
  saving,
  ...props
}: HeaderProps): JSX.Element => {
  const user = useLoggedInUser();
  const history = useHistory();

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
          <ShowHide show={showHeaderSidebarToggle}>
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
          <DropdownMenu
            className={"header-dropdown"}
            menuClassName={"header-dropdown-menu"}
            menuId={"support-menu"}
            models={[
              {
                id: "feedback",
                label: "Feedback/Feature Request",
                onClick: () => {
                  if (!isNil(process.env.REACT_APP_CANNY_FEEDBACK_URL)) {
                    window.open(process.env.REACT_APP_CANNY_FEEDBACK_URL, "_blank");
                  } else {
                    console.warn(
                      `Could not identify Canny feedback URL as ENV variable
											'REACT_APP_CANNY_FEEDBACK_URL; is not defined.`
                    );
                  }
                },
                icon: <Icon icon={"bullhorn"} weight={"light"} />
              },
              {
                id: "intercom-chat",
                label: "Chat with Support",
                icon: <Icon icon={"comment-dots"} weight={"light"} />
              }
            ]}
          >
            <HelpLink />
          </DropdownMenu>
          <DropdownMenu
            models={[
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
                id: "logout",
                label: "Logout",
                onClick: () => history.push("/logout"),
                icon: <Icon icon={"sign-out"} weight={"light"} />
              }
            ]}
          >
            <AccountCircleLink user={user} />
          </DropdownMenu>
        </div>
      </div>
      <div id={"supplementary-header"}></div>
    </Layout.Header>
  );
};

export default React.memo(Header);

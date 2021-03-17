import { ReactNode } from "react";
import { useHistory } from "react-router-dom";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faAddressCard } from "@fortawesome/free-solid-svg-icons";

import { Layout } from "antd";

import { Dropdown } from "components/control/dropdowns";
import { AccountCircleLink } from "components/control/links";
import { ShowHide } from "components/display";
import { useLoggedInUser } from "store/hooks";

import Toolbar, { IToolbarItem } from "./Toolbar";

import "./index.scss";

interface HeaderProps {
  toolbar?: IToolbarItem[] | (() => JSX.Element);
  breadcrumbs?: ReactNode;
}

const Header = ({ breadcrumbs, toolbar }: HeaderProps): JSX.Element => {
  const user = useLoggedInUser();
  const history = useHistory();

  return (
    <Layout.Header className={"header"}>
      <div className={"breadcrumb-wrapper"}>
        <ShowHide show={!isNil(breadcrumbs)}>{breadcrumbs}</ShowHide>
      </div>
      <div className={"toolbar-wrapper"}>
        {!isNil(toolbar) && (Array.isArray(toolbar) ? <Toolbar items={toolbar as IToolbarItem[]} /> : toolbar())}
      </div>
      <Dropdown
        items={[
          { text: "Profile", onClick: () => history.push("/profile"), icon: <FontAwesomeIcon icon={faAddressCard} /> },
          { text: "Logout", onClick: () => history.push("/logout"), icon: <FontAwesomeIcon icon={faSignOutAlt} /> }
        ]}
      >
        <div className={"account-wrapper"}>
          <AccountCircleLink user={user} />
        </div>
      </Dropdown>
    </Layout.Header>
  );
};

export default Header;

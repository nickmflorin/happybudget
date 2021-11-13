import React from "react";
import { useHistory } from "react-router-dom";

import { Icon } from "components";
import { AccountCircleLink } from "components/links";
import { users } from "lib";

import DropdownMenu, { DropdownMenuProps } from "./DropdownMenu";

const UserDropdownMenu = (props: Omit<DropdownMenuProps, "models" | "menuClassName" | "children">): JSX.Element => {
  const user = users.hooks.useLoggedInUser();
  const history = useHistory();

  return (
    <DropdownMenu
      {...props}
      menuClassName={"header-dropdown-menu"}
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
  );
};

export default React.memo(UserDropdownMenu);

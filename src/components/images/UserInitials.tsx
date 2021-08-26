import { useMemo } from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { ShowHide } from "components";

import "./UserInitials.scss";

export interface UserInitialsProps extends StandardComponentProps {
  readonly user?: Model.User | Model.SimpleUser | Model.Contact;
  readonly circle?: boolean;
  readonly initials?: string | null;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly renderNoInitials?: JSX.Element;
  readonly hideOnNoInitials?: boolean;
  readonly overlay?: () => JSX.Element;
}

const UserInitials = ({
  user,
  initials,
  firstName,
  lastName,
  renderNoInitials,
  hideOnNoInitials,
  overlay,
  ...props
}: Omit<UserInitialsProps, "src">): JSX.Element => {
  const userFirstName = useMemo<string | null>(() => {
    if (!isNil(firstName)) {
      return firstName;
    } else if (!isNil(user)) {
      return user.first_name;
    }
    return null;
  }, [user, firstName]);

  const userLastName = useMemo<string | null>(() => {
    if (!isNil(lastName)) {
      return lastName;
    } else if (!isNil(user)) {
      return user.last_name;
    }
    return null;
  }, [user, lastName]);

  const userInitials = useMemo<string>(() => {
    if (!isNil(initials)) {
      return initials;
    } else {
      if (!isNil(userFirstName) && !isNil(userLastName)) {
        // First name and last name will always be present for a User, but not necessarily
        // a Contact.
        return userFirstName.charAt(0) + userLastName.charAt(0);
      } else if (!isNil(userFirstName)) {
        return userFirstName.charAt(0);
      } else if (!isNil(userLastName)) {
        return userLastName.charAt(0);
      } else {
        return "";
      }
    }
  }, [initials, userFirstName, userLastName]);

  return (
    <ShowHide hide={hideOnNoInitials === true && userInitials === ""}>
      <div className={classNames("user-initials", { circle: props.circle }, props.className)} style={props.style}>
        {!isNil(overlay) && overlay()}
        <ShowHide show={isNil(renderNoInitials) || userInitials !== ""}>
          <div className={"user-initials-text"}>{userInitials}</div>
        </ShowHide>
        <ShowHide show={!isNil(renderNoInitials) && userInitials === ""}>{renderNoInitials}</ShowHide>
      </div>
    </ShowHide>
  );
};

export default UserInitials;

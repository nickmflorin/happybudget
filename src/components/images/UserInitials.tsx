import classNames from "classnames";

import { model, ui } from "lib";
import { ShowHide } from "components/util";

export type UserInitialsProps = ui.ComponentProps<{
  readonly user?: model.User | model.SimpleUser | model.Contact;
  readonly circle?: true;
  readonly initials?: string | null;
  readonly firstName?: string | null;
  readonly lastName?: string | null;
  readonly renderNoInitials?: JSX.Element;
  readonly hideOnNoInitials?: boolean;
  readonly overlay?: () => JSX.Element;
}>;

const getFirstName = (props: Pick<UserInitialsProps, "firstName" | "user">) =>
  props.firstName !== undefined
    ? props.firstName
    : props.user !== undefined
    ? props.user.first_name
    : null;

const getLastName = (props: Pick<UserInitialsProps, "lastName" | "user">) =>
  props.lastName !== undefined
    ? props.lastName
    : props.user !== undefined
    ? props.user.last_name
    : null;

const getInitials = (
  props: Pick<UserInitialsProps, "initials" | "user" | "firstName" | "lastName">,
) => {
  if (props.initials !== undefined) {
    return props.initials;
  }
  const firstName = getFirstName(props);
  const lastName = getLastName(props);
  if (firstName !== null && lastName !== null) {
    return firstName.charAt(0) + lastName.charAt(0);
  } else if (firstName !== null) {
    return firstName.charAt(0);
  } else if (lastName !== null) {
    return lastName.charAt(0);
  }
  return "";
};

export const UserInitials = ({
  user,
  circle,
  initials,
  firstName,
  lastName,
  renderNoInitials,
  hideOnNoInitials,
  overlay,
  ...props
}: UserInitialsProps): JSX.Element => {
  const _initials = getInitials({ user, firstName, lastName, initials });
  return (
    <ShowHide hide={hideOnNoInitials === true && _initials === ""}>
      <div
        {...props}
        className={classNames("user-initials", { circle }, props.className)}
        style={props.style}
      >
        {overlay !== undefined && overlay()}
        <ShowHide show={renderNoInitials === undefined || _initials !== ""}>
          <div className="user-initials__text">{_initials}</div>
        </ShowHide>
        <ShowHide show={renderNoInitials !== undefined && _initials === ""}>
          {renderNoInitials}
        </ShowHide>
      </div>
    </ShowHide>
  );
};

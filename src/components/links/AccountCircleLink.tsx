import { Link } from "react-router-dom";
import classNames from "classnames";

import { UserImageOrInitials } from "components/images";
import { UserImageOrInitialsProps } from "components/images/UserImageOrInitials";

import "./AccountCircleLink.scss";

const AccountCircleLink = ({
  className,
  style,
  onClick,
  ...props
}: UserImageOrInitialsProps & { readonly onClick?: () => void }): JSX.Element => {
  // Note: We have to expose the onClick prop in order for this component to be used
  // inside of an AntD dropdown.
  return (
    <Link to={"#"} className={classNames("account-circle-link", className)} style={style} onClick={onClick}>
      <UserImageOrInitials {...props} />
    </Link>
  );
};

export default AccountCircleLink;

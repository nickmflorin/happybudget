import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";

import { UserImageOrInitials } from "components/images";
import { UserImageOrInitialsProps } from "components/images/UserImageOrInitials";

interface AccountCircleLinkProps extends UserImageOrInitialsProps {
  readonly id?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly onClick?: () => void;
}

const AccountCircleLink = ({ id, className, style, onClick, ...props }: AccountCircleLinkProps): JSX.Element => (
  <Link to={"#"} id={id} className={classNames("link--account-circle", className)} style={style} onClick={onClick}>
    <UserImageOrInitials {...props} />
  </Link>
);

export default React.memo(AccountCircleLink);

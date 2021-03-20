import { Link } from "react-router-dom";
import { isNil } from "lodash";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";

import { ShowHide } from "components/display";

import "./AccountCircleLink.scss";

interface AccountCircleLinkProps {
  className?: string;
  style?: any;
  user: IUser | ISimpleUser;
}

const AccountCircleLink = ({ className, user, style }: AccountCircleLinkProps): JSX.Element => {
  return (
    <Link to={"#"} className={classNames("account-circle-link", className)} style={style}>
      <ShowHide show={!isNil(user.profile_image)}>
        <img className={"user-profile-img"} alt={"User"} src={user.profile_image} />
      </ShowHide>
      <ShowHide show={isNil(user.profile_image)}>
        <FontAwesomeIcon className={"user-circle-icon"} icon={faUserCircle} />
      </ShowHide>
    </Link>
  );
};

export default AccountCircleLink;

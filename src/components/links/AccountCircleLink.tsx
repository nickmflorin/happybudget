import { Link } from "react-router-dom";
import { isNil } from "lodash";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-solid-svg-icons";

import "./AccountCircleLink.scss";

interface AccountCircleLinkProps extends StandardComponentProps {
  user: Model.User | Model.SimpleUser;
}

const AccountCircleLink = ({ className, user, style }: AccountCircleLinkProps): JSX.Element => {
  return (
    <Link to={"#"} className={classNames("account-circle-link", className)} style={style}>
      {!isNil(user.profile_image) ? (
        <img className={"user-profile-img"} alt={"User"} src={user.profile_image} />
      ) : (
        <FontAwesomeIcon className={"user-circle-icon"} icon={faUserCircle} />
      )}
    </Link>
  );
};

export default AccountCircleLink;

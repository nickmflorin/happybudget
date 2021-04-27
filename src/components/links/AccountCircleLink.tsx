import { Link } from "react-router-dom";
import { isNil } from "lodash";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
        <div className={"user-circle-icon"}>
          <span className={"user-circle-text"}>{user.first_name[0] + user.last_name[0]}</span>
        </div>
      )}
    </Link>
  );
};

export default AccountCircleLink;

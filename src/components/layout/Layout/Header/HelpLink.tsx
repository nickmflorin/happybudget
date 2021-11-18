import { Icon } from "components";
import { Link } from "components/links";

import "./HelpLink.scss";

const HelpLink = ({ onClick }: { readonly onClick?: () => void }): JSX.Element => {
  return (
    <Link className={"help-link"} onClick={onClick}>
      <Icon icon={"question-circle"} />
      <div className={"text-container"}>{"Help"}</div>
    </Link>
  );
};

export default HelpLink;

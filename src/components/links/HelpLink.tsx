import classNames from "classnames";

import { Icon } from "components";
import { Link, LinkProps } from "components/links";

import "./HelpLink.scss";

type HelpLinkProps = Omit<LinkProps, "children">;

const HelpLink = (props: HelpLinkProps): JSX.Element => {
  return (
    <Link {...props} className={classNames("help-link", props.className)}>
      <Icon icon={"question-circle"} />
      <div className={"text-container"}>{"Help"}</div>
    </Link>
  );
};

export default HelpLink;

import React from "react";

import classNames from "classnames";

import { Icon } from "components";
import { Link, LinkProps } from "components/links";

type HelpLinkProps = Omit<LinkProps, "children">;

const HelpLink = (props: HelpLinkProps): JSX.Element => (
  <Link {...props} className={classNames("link--help", props.className)}>
    <Icon icon="question-circle" />
    <div className="text-container">Help</div>
  </Link>
);

export default React.memo(HelpLink);

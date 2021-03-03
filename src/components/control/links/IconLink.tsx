import React from "react";
import classNames from "classnames";
import Link from "./Link";

interface IconLinkProps {
  className?: string;
  icon: JSX.Element;
  [key: string]: any;
}

/**
 * A consistently styled <a> component for links that contain just an Icon.
 */
const IconLink = ({ className, icon, ...props }: IconLinkProps): JSX.Element => (
  <Link className={classNames("link--icon-only", className)} icon={icon} {...props} />
);

export default IconLink;

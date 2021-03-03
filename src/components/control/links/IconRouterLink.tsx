import React, { ReactNode } from "react";
import classNames from "classnames";
import RouterLink from "./RouterLink";

interface IconRouterLinkProps {
  className?: string;
  icon: ReactNode;
  [key: string]: any;
}

/**
 * A consistently styled <Link> component for react-router-dom Link components\
 * that contain just an Icon.
 */
const IconRouterLink = ({ className, icon, ...props }: IconRouterLinkProps): JSX.Element => (
  <RouterLink className={classNames("link--icon-only", className)} icon={icon} {...props} />
);

export default IconRouterLink;

import { ReactNode } from "react";
import classNames from "classnames";
import RouterLink, { RouterLinkProps } from "./RouterLink";

interface IconRouterLinkProps extends Omit<RouterLinkProps, "icon" | "children"> {
  readonly icon: ReactNode;
}

/**
 * A consistently styled <Link> component for react-router-dom Link components\
 * that contain just an Icon.
 */
const IconRouterLink = ({ icon, ...props }: IconRouterLinkProps): JSX.Element => (
  <RouterLink {...props} className={classNames("link--icon-only", props.className)} icon={icon} />
);

export default IconRouterLink;

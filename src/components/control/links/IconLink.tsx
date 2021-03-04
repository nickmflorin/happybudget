import { ReactNode } from "react";
import classNames from "classnames";
import Link from "./Link";

interface IconLinkProps {
  className?: string;
  icon: ReactNode;
  children?: ReactNode;
  [key: string]: any;
}

/**
 * A consistently styled <a> component for links that contain just an Icon.
 */
const IconLink = ({ className, children, icon, ...props }: IconLinkProps): JSX.Element => (
  <Link className={classNames("link--icon-only", className)} children={children} icon={icon} {...props} />
);

export default IconLink;

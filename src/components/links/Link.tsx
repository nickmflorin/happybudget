import { ReactNode } from "react";
import classNames from "classnames";
import { GenericClickable } from "components/util";

interface LinkProps {
  className?: string;
  children: ReactNode;
  [key: string]: any;
}

/**
 * A consistently styled <a> component with functionality allowing the link to
 * include icons, be disabled and other features.
 */
const Link = ({ className, children, ...props }: LinkProps): JSX.Element => (
  <GenericClickable
    className={classNames(className, "link")}
    children={children}
    component={({ ...g }: { [key: string]: any }) => <a {...g}>{g.children}</a>}
    {...props}
  />
);

export default Link;

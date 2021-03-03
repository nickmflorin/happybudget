import React from "react";
import classNames from "classnames";
import GenericClickable from "components/control/GenericClickable";

interface LinkProps {
  className?: string;
  [key: string]: any;
}

/**
 * A consistently styled <a> component with functionality allowing the link to
 * include icons, be disabled and other features.
 */
const Link = ({ className, ...props }: LinkProps): JSX.Element => (
  <GenericClickable
    className={classNames(className, "link")}
    component={({ ...g }: { [key: string]: any }) => <a {...g}>{g.children}</a>}
    {...props}
  />
);

export default Link;

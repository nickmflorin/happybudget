import React, { ReactNode } from "react";
import classNames from "classnames";
import Button from "./Button";

interface IconButtonProps {
  className?: string;
  icon: ReactNode;
  [key: string]: any;
}

/**
 * A consistently styled Button component for buttons that contain just an Icon.
 */
const IconButton = ({ className, icon, ...props }: IconButtonProps): JSX.Element => (
  <Button className={classNames("btn--icon-only", className)} icon={icon} {...props} />
);

export default IconButton;

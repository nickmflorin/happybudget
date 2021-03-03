import React from "react";
import classNames from "classnames";
import { Button as AntDButton } from "antd";
import GenericClickable from "components/control/GenericClickable";

interface ButtonProps {
  className?: string;
  [key: string]: any;
}

/**
 * A consistently styled Button component for consistently styled and themed
 * buttons wrapped around AntD's Button class.
 */
const Button = ({ className, ...props }: ButtonProps): JSX.Element => (
  <GenericClickable className={classNames("btn", className)} component={AntDButton} {...props} />
);

export default Button;

import { ReactNode } from "react";
import classNames from "classnames";
import { Button as AntDButton } from "antd";
import { GenericClickable } from "components/util";

interface ButtonProps {
  className?: string;
  children: ReactNode;
  [key: string]: any;
}

/**
 * A consistently styled Button component for consistently styled and themed
 * buttons wrapped around AntD's Button class.
 */
const Button = ({ className, children, ...props }: ButtonProps): JSX.Element => (
  <GenericClickable className={classNames("btn", className)} component={AntDButton} children={children} {...props} />
);

export default Button;

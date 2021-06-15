import { ReactNode } from "react";
import classNames from "classnames";
import { Button as AntDButton } from "antd";
import { GenericClickable } from "components/util";

interface ButtonProps extends StandardComponentProps {
  children: ReactNode;
  [key: string]: any;
}

/**
 * A consistently styled Button component for consistently styled and themed
 * buttons wrapped around AntD's Button class.
 */
const Button = ({ children, ...props }: ButtonProps): JSX.Element => (
  <GenericClickable
    {...props}
    component={AntDButton}
    children={children}
    className={classNames("btn", props.className)}
  />
);

export default Button;

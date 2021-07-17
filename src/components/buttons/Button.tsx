import { ReactNode } from "react";
import classNames from "classnames";
import { Button as AntDButton } from "antd";
import { ButtonProps as AntDButtonProps } from "antd/lib/button";
import { GenericClickable } from "components/util";

export interface ButtonProps extends Omit<AntDButtonProps, "icon" | "className" | "style" | "id">, ClickableProps {
  readonly children?: ReactNode;
  readonly disabled?: boolean;
}

/**
 * A consistently styled Button component for consistently styled and themed
 * buttons wrapped around AntD's Button class.
 */
const Button = (props: ButtonProps): JSX.Element => (
  <GenericClickable {...props} component={AntDButton} className={classNames("btn", props.className)} />
);

export default Button;

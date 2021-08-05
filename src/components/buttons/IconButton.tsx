import { ReactNode } from "react";
import classNames from "classnames";
import Button, { ButtonProps } from "./Button";

export interface IconButtonProps extends Omit<ButtonProps, "size" | "icon"> {
  icon: ReactNode;
  size?: "small" | "medium" | "large";
}

/**
 * A consistently styled Button component for buttons that contain just an Icon.
 */
const IconButton = ({ icon, size = "medium", ...props }: IconButtonProps): JSX.Element => (
  <Button
    {...props}
    icon={icon}
    className={classNames("btn btn--icon-only", props.className, {
      medium: size === "medium",
      small: size === "small",
      large: size === "large"
    })}
  />
);

export default IconButton;

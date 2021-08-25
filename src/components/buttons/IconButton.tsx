import classNames from "classnames";
import Button, { ButtonProps } from "./Button";

export interface IconButtonProps extends Omit<ButtonProps, "size" | "icon" | "children"> {
  readonly icon: IconOrElement | ((params: ClickableIconCallbackParams) => IconOrElement);
  readonly size?: "small" | "medium" | "large" | "xsmall" | "xxsmall";
}

/**
 * A consistently styled Button component for buttons that contain just an Icon.
 */
const IconButton = ({ icon, size = "large", ...props }: IconButtonProps): JSX.Element => (
  <Button
    {...props}
    icon={icon}
    className={classNames("btn btn--icon-only", props.className, {
      medium: size === "medium",
      small: size === "small",
      large: size === "large",
      xxsmall: size === "xxsmall",
      xsmall: size === "xsmall"
    })}
  />
);

export default IconButton;

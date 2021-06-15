import { ReactNode } from "react";
import classNames from "classnames";
import Button from "./Button";

interface IconButtonProps extends StandardComponentProps {
  icon: ReactNode;
  children?: ReactNode;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  [key: string]: any;
}

/**
 * A consistently styled Button component for buttons that contain just an Icon.
 */
const IconButton = ({ children, disabled = false, icon, size = "medium", ...props }: IconButtonProps): JSX.Element => (
  <Button
    {...props}
    className={classNames("btn--icon-only", props.className, {
      medium: size === "medium",
      small: size === "small",
      large: size === "large",
      disabled
    })}
    icon={icon}
    children={children}
    style={props.style}
  />
);

export default IconButton;

import { ReactNode } from "react";
import classNames from "classnames";
import Button from "./Button";

interface IconButtonProps {
  className?: string;
  icon: ReactNode;
  children?: ReactNode;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  [key: string]: any;
}

/**
 * A consistently styled Button component for buttons that contain just an Icon.
 */
const IconButton = ({
  className,
  children,
  disabled = false,
  icon,
  size = "medium",
  ...props
}: IconButtonProps): JSX.Element => (
  <Button
    className={classNames("btn--icon-only", className, {
      medium: size === "medium",
      small: size === "small",
      large: size === "large",
      disabled
    })}
    icon={icon}
    children={children}
    {...props}
  />
);

export default IconButton;

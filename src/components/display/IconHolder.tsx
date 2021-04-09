import React from "react";
import classNames from "classnames";

interface IconHolderProps {
  className?: string;
  children: JSX.Element;
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  [key: string]: any;
}

const IconHolder: React.FC<IconHolderProps> = ({
  className,
  children,
  disabled = false,
  size = "medium",
  ...props
}) => (
  <div
    className={classNames("icon-holder", className, {
      medium: size === "medium",
      small: size === "small",
      large: size === "large",
      disabled
    })}
    {...props}
  >
    {children}
  </div>
);

export default IconHolder;

import React from "react";
import classNames from "classnames";

import { ui } from "lib";
import Button, { ButtonProps } from "./Button";

export interface IconButtonProps
  extends Omit<ButtonProps, "size" | "icon" | "children">,
    UseSizeProps<"small" | "medium" | "large" | "xsmall" | "xxsmall"> {
  readonly icon: IconOrElement | ((params: ClickableIconCallbackParams) => IconOrElement);
  readonly fill?: boolean;
}

/**
 * A consistently styled Button component for buttons that contain just an Icon.
 */
const IconButton = ({
  icon,
  fill,
  size = "large",
  small,
  medium,
  large,
  xsmall,
  xxsmall,
  ...props
}: IconButtonProps): JSX.Element => {
  const _size = ui.hooks.useSize(
    { options: ["small", "medium", "large", "xsmall", "xxsmall"] },
    { size, small, medium, large, xsmall, xxsmall }
  );
  return <Button {...props} icon={icon} className={classNames("btn--icon-only", props.className, { fill }, _size)} />;
};

export default React.memo(IconButton);

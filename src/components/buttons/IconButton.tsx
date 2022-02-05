import React from "react";
import classNames from "classnames";

import { ui } from "lib";
import Button, { ButtonProps } from "./Button";
import { isNil } from "lodash";

export interface IconButtonProps
  extends Omit<ButtonProps, "size" | "icon" | "children">,
    UseSizeProps<"small" | "medium" | "large" | "xsmall" | "xxsmall"> {
  readonly icon: IconOrElement | ((params: ClickableIconCallbackParams) => IconOrElement);
  readonly fill?: boolean;
  readonly outersize?: number;
}

/**
 * A consistently styled Button component for buttons that contain just an Icon.
 */
const IconButton = ({
  icon,
  fill,
  size = "large",
  outersize,
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
  return (
    <Button
      {...props}
      icon={icon}
      className={classNames("btn--icon-only", props.className, { fill }, _size)}
      style={
        !isNil(outersize) ? { height: outersize, width: outersize, minWidth: outersize, ...props.style } : props.style
      }
    />
  );
};

export default React.memo(IconButton);

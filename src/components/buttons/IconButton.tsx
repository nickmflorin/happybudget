import React from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { withSize } from "components/hocs";
import Button, { ButtonProps } from "./Button";

type IconButtonSize = "small" | "medium" | "large" | "xsmall" | "xxsmall";

type PrivateIconButtonProps = Omit<ButtonProps, "icon" | "children"> & {
  readonly icon: IconOrElement | ((params: ClickableIconCallbackParams) => IconOrElement);
  readonly fill?: boolean;
  readonly outersize?: number;
};

export type IconButtonProps = PrivateIconButtonProps & UseSizeProps<IconButtonSize>;

/**
 * A consistently styled Button component for buttons that contain just an Icon.
 */
const IconButton = ({ icon, fill, outersize, ...props }: IconButtonProps): JSX.Element => (
  <Button
    {...props}
    icon={icon}
    className={classNames("btn--icon-only", props.className, { fill })}
    style={
      !isNil(outersize) ? { height: outersize, width: outersize, minWidth: outersize, ...props.style } : props.style
    }
  />
);

export default withSize<IconButtonProps, IconButtonSize>(["small", "medium", "large", "xsmall", "xxsmall"], {
  default: "large"
})(React.memo(IconButton));

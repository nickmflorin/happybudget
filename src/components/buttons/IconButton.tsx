import React from "react";

import classNames from "classnames";

import { withSize } from "components/hocs";

import Button, { ButtonProps } from "./Button";

/* With the IconButton, the "IconButtonIconSize" does not determine the size
   attributes of the Icon directly, but instead determines the size of the
   padding around the Icon - which indirectly determines the size. */
type IconButtonIconSize = StandardSize | "xsmall";

type PrivateIconButtonProps = Omit<ButtonProps, "icon" | "children"> & {
  readonly icon: IconOrElement | ((params: ClickableIconCallbackParams) => IconOrElement);
  readonly fill?: boolean;
  /* If the iconDimension is provided, this is the value that will be used for
     the height and the width - not the `iconSize` prop. */
  readonly iconDimension?: number;
};

export type IconButtonProps = PrivateIconButtonProps & UseSizeProps<IconButtonIconSize, "iconSize">;

const IconButton = ({ fill, ...props }: PrivateIconButtonProps): JSX.Element => (
  <Button {...props} className={classNames("btn--icon-only", props.className, { fill })} />
);

export default withSize<IconButtonProps, IconButtonIconSize, "iconSize">({
  classNamePrefix: "icon-",
  sizeProp: "iconSize",
})(React.memo(IconButton));

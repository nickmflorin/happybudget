import React from "react";

import classNames from "classnames";

import Button, { ButtonProps } from "./Button";

export interface PrimaryIconButtonProps extends Omit<ButtonProps, "icon" | "children"> {
  readonly icon: IconOrElement | ((params: ClickableIconCallbackParams) => IconOrElement);
}

const PrimaryIconButton = ({ icon, ...props }: PrimaryIconButtonProps): JSX.Element => (
  <Button
    {...props}
    icon={icon}
    className={classNames("btn--primary-icon-only", props.className)}
  />
);

export default React.memo(PrimaryIconButton);

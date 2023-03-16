import React from "react";

import classNames from "classnames";

import Button, { ButtonProps } from "./Button";

export type DefaultIconButtonProps = Omit<ButtonProps, "children">;

const DefaultIconButton = (props: DefaultIconButtonProps): JSX.Element => (
  <Button {...props} className={classNames("btn--default-icon-only", props.className)} />
);

export default React.memo(DefaultIconButton);

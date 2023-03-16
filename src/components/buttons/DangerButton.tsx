import React from "react";

import classNames from "classnames";

import Button, { ButtonProps } from "./Button";

export type DangerButtonProps = ButtonProps;

const DangerButton = (props: DangerButtonProps): JSX.Element => (
  <Button {...props} className={classNames("btn--danger", props.className)} />
);

export default React.memo(DangerButton);

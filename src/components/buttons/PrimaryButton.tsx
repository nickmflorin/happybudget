import React from "react";
import classNames from "classnames";
import Button, { ButtonProps } from "./Button";

export type PrimaryButtonProps = ButtonProps;

const PrimaryButton = (props: PrimaryButtonProps): JSX.Element => (
  <Button {...props} className={classNames("btn--primary", props.className)} />
);

export default React.memo(PrimaryButton);

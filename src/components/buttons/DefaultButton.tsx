import React from "react";
import classNames from "classnames";
import Button, { ButtonProps } from "./Button";

export type DefaultButtonProps = ButtonProps;

const DefaultButton = (props: DefaultButtonProps): JSX.Element => (
  <Button {...props} className={classNames("btn--default", props.className)} />
);

export default React.memo(DefaultButton);

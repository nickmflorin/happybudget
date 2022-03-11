import React from "react";
import classNames from "classnames";
import Button, { ButtonProps } from "./Button";

const ButtonDangerLink = (props: ButtonProps): JSX.Element => (
  <Button {...props} className={classNames("btn--danger-link", props.className)} />
);

export default React.memo(ButtonDangerLink);

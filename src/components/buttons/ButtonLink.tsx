import React from "react";
import classNames from "classnames";
import Button, { ButtonProps } from "./Button";

const ButtonLink = (props: ButtonProps): JSX.Element => (
  <Button {...props} className={classNames("btn--link", props.className)} />
);

export default React.memo(ButtonLink);

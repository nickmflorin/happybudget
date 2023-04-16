import React from "react";

import classNames from "classnames";

import Button, { ButtonProps } from "./Button";

const BareButton = (props: ButtonProps): JSX.Element => (
  <Button {...props} className={classNames("btn--bare", props.className)} />
);

export default React.memo(BareButton);

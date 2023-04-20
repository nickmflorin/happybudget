import React from "react";

import classNames from "classnames";

import { Icon } from "components";

import Input, { InputProps } from "./Input";

export type EmailInputProps = InputProps;

const EmailInput = (props: EmailInputProps): JSX.Element => (
  <Input
    placeholder="Email"
    prefix={<Icon icon="envelope" weight="solid" />}
    {...props}
    className={classNames("input", "input--email", props.className)}
  />
);

export default React.memo(EmailInput);

import React from "react";
import { Input as AntDInput } from "antd";
import { InputProps as AntDInputProps } from "antd/lib/input";
import classNames from "classnames";

import { Icon } from "components";

export type PasswordInputProps = AntDInputProps;

const PasswordInput = (props: PasswordInputProps): JSX.Element => (
  <AntDInput.Password
    placeholder={"Passsword"}
    prefix={<Icon icon={"lock"} />}
    {...props}
    className={classNames("input", "input--password", props.className)}
  />
);

export default React.memo(PasswordInput);

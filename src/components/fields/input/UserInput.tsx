import React from "react";
import classNames from "classnames";
import { Icon } from "components";
import Input, { InputProps } from "./Input";

export type UserInputProps = InputProps;

const UserInput = (props: UserInputProps): JSX.Element => (
  <Input
    prefix={<Icon icon={"user"} className={"icon"} />}
    {...props}
    className={classNames("input", "input--user", props.className)}
  />
);

export default React.memo(UserInput);

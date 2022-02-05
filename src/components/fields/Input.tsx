import React, { forwardRef } from "react";
import { Input as AntDInput } from "antd";
import { InputProps as AntDInputProps } from "antd/lib/input";
import classNames from "classnames";

export type InputProps = AntDInputProps & {
  readonly small?: boolean;
};

const Input = ({ small, ...props }: InputProps, ref: React.ForwardedRef<AntDInput>): JSX.Element => (
  <AntDInput {...props} ref={ref} className={classNames("input", { "input--small": small }, props.className)} />
);

const ForwardRefInput = forwardRef(Input);
export default React.memo(ForwardRefInput);

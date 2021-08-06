import React, { forwardRef } from "react";
import { Input as AntDInput } from "antd";
import { InputProps as AntDInputProps } from "antd/lib/input";
import classNames from "classnames";

export type InputProps = AntDInputProps;

const Input = (props: InputProps, ref: React.ForwardedRef<AntDInput>): JSX.Element => (
  <AntDInput {...props} ref={ref} className={classNames("input", props.className)} />
);

export default forwardRef(Input);

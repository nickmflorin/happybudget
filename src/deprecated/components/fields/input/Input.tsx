import React, { forwardRef } from "react";

import classNames from "classnames";
import { InputRef, Input as AntDInput } from "antd";
import { InputProps as AntDInputProps } from "antd/lib/input";

import { withSize } from "components/hocs";

/* The size related props are exposed outside of this component but not inside
   the component, because they are automatically wrapped into the className by
   the HOC. */
type PrivateInputProps = Omit<AntDInputProps, "size">;

export type InputProps = PrivateInputProps & UseSizeProps;

const Input = (props: PrivateInputProps, ref: React.ForwardedRef<InputRef>): JSX.Element => (
  <AntDInput {...props} ref={ref} className={classNames("input", props.className)} />
);

export default withSize<InputProps, StandardSize, "size", InputRef>({
  hasRef: true,
})(forwardRef(Input)) as React.ForwardRefRenderFunction<
  InputRef,
  InputProps & { readonly ref?: React.ForwardedRef<InputRef> }
>;

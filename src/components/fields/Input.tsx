import React, { forwardRef } from "react";
import { Input as AntDInput } from "antd";
import { InputProps as AntDInputProps } from "antd/lib/input";
import classNames from "classnames";

import { withSize } from "components/hocs";

/* The size related props are exposed outside of this component but not inside
   the component, because they are automatically wrapped into the className by
   the HOC. */
type PrivateInputProps = Omit<AntDInputProps, "size">;

export type InputProps = PrivateInputProps & UseSizeProps<"small" | "medium" | "large">;

const Input = (props: PrivateInputProps, ref: React.ForwardedRef<AntDInput>): JSX.Element => (
  <AntDInput {...props} ref={ref} className={classNames("input", props.className)} />
);

export default withSize<InputProps, "small" | "medium" | "large">(["small", "medium", "large"], {
  classNamePrefix: "input--"
})(React.memo(forwardRef(Input)));

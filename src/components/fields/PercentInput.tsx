import React, { forwardRef } from "react";
import { isNil } from "lodash";
import { InputNumber } from "antd";
import { InputNumberProps } from "antd/lib/input-number";
import classNames from "classnames";

export type PercentInputProps = InputNumberProps;

const PercentInput = (props: PercentInputProps, ref: React.ForwardedRef<typeof InputNumber>): JSX.Element => (
  <InputNumber
    defaultValue={100}
    min={0}
    max={100}
    formatter={(value: string | number | undefined) => {
      if (!isNil(value)) {
        if (typeof value === "string") {
          value = parseFloat(value);
        }
        if (!isNaN(value)) {
          return `${(value * 100.0).toFixed(2)} %`;
        }
      }
      return "";
    }}
    precision={2}
    parser={(value: string | undefined) => {
      if (!isNil(value)) {
        const numeric = parseFloat(value.replace("%", ""));
        if (!isNaN(numeric)) {
          return (numeric / 100.0).toFixed(2);
        }
      }
      return 0.0;
    }}
    {...props}
    className={classNames("input", props.className)}
  />
);

const ForwardRefInput = forwardRef(PercentInput);
export default React.memo(ForwardRefInput);

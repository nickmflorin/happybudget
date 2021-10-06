import React from "react";
import { Icon } from "components";
import Input, { InputProps } from "./Input";

interface PercentInputProps extends InputProps {}

const PercentInput = (props: PercentInputProps): JSX.Element => {
  return <Input size={"large"} {...props} suffix={<Icon icon={"percentage"} />} />;
};

export default React.memo(PercentInput);

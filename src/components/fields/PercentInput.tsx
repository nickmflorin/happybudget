import React from "react";
import { Icon } from "components";
import Input, { InputProps } from "./Input";

const PercentInput = (props: InputProps): JSX.Element => {
  return <Input size={"large"} {...props} suffix={<Icon icon={"percentage"} />} />;
};

export default React.memo(PercentInput);

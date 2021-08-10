import { Input as AntDInput } from "antd";
import { InputProps as AntDInputProps } from "antd/lib/input";
import classNames from "classnames";

export type InputProps = AntDInputProps;

const Input = (props: InputProps): JSX.Element => (
  <AntDInput {...props} className={classNames("input", props.className)} />
);

export default Input;

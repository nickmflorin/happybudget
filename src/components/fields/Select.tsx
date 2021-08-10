import { Select as AntDSelect } from "antd";
import { SelectProps as AntDSelectProps, SelectValue } from "antd/lib/select";
import classNames from "classnames";

export type SelectProps<T> = AntDSelectProps<T>;

const Select = <T extends SelectValue>(props: SelectProps<T>): JSX.Element => (
  <AntDSelect {...props} className={classNames("select", props.className)} />
);

Select.Option = AntDSelect.Option;

export default Select;

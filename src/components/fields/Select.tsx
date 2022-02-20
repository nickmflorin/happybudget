import { Select as AntDSelect } from "antd";
import { SelectProps as AntDSelectProps, SelectValue } from "antd/lib/select";
import classNames from "classnames";

import { withSize } from "components/hocs";

type PrivateSelectProps<T> = Omit<AntDSelectProps<T>, "size">;

export type SelectProps<T> = PrivateSelectProps<T> & UseSizeProps<"small" | "medium" | "large">;

const Select = <T extends SelectValue>(props: PrivateSelectProps<T>): JSX.Element => (
  <AntDSelect {...props} className={classNames("select", props.className, { disabled: props.disabled })} />
);

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const SelectWithSize = withSize<SelectProps<any>, "small" | "standard" | "medium" | "large">({
  options: ["small", "medium", "standard", "large"]
})(Select) as {
  <T extends SelectValue>(props: SelectProps<T>): JSX.Element;
  Option: typeof AntDSelect.Option;
};

SelectWithSize.Option = AntDSelect.Option;

export default SelectWithSize;

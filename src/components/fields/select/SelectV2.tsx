import React from "react";

import RCSelect, { Props, GroupBase } from "react-select";
import classNames from "classnames";

export type SelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
> = Props<Option, IsMulti, Group> & {
  readonly borderless?: boolean;
};

const Select = <O, M extends boolean = false, G extends GroupBase<O> = GroupBase<O>>({
  borderless,
  ...props
}: SelectProps<O, M, G>): JSX.Element => (
  <RCSelect
    {...props}
    className={classNames("react-select-container", props.className, { borderless })}
    classNamePrefix={"react-select"}
  />
);

export default React.memo(Select) as typeof Select;

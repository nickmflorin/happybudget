import React from "react";
import RCSelect, { Props, GroupBase } from "react-select";
import classNames from "classnames";

import { ConditionalWrapper } from "components";

export type SelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
> = Props<Option, IsMulti, Group> & {
  readonly borderless?: boolean;
  readonly wrapperStyle?: React.CSSProperties;
};

const Select = <O, M extends boolean = false, G extends GroupBase<O> = GroupBase<O>>({
  borderless,
  wrapperStyle,
  ...props
}: SelectProps<O, M, G>): JSX.Element => (
  <ConditionalWrapper conditional={wrapperStyle !== undefined} style={wrapperStyle}>
    <RCSelect
      {...props}
      className={classNames("react-select-container", props.className, { borderless })}
      classNamePrefix={"react-select"}
    />
  </ConditionalWrapper>
);

export default React.memo(Select) as typeof Select;

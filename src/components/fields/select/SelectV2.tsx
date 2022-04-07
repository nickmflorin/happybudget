import React from "react";
import RCSelect, { Props, GroupBase } from "react-select";
import classNames from "classnames";

import { ConditionalWrapper } from "components";
import Option from "./Option";

export type SelectProps<
  O extends SelectOption,
  IsMulti extends boolean = false,
  Group extends SelectGroupBase<O> = SelectGroupBase<O>
> = Props<O, IsMulti, Group> & {
  readonly borderless?: boolean;
  readonly wrapperStyle?: React.CSSProperties;
};

const Select = <O extends SelectOption, IsMulti extends boolean = false, G extends GroupBase<O> = GroupBase<O>>({
  borderless,
  wrapperStyle,
  ...props
}: SelectProps<O, IsMulti, G>): JSX.Element => (
  <ConditionalWrapper conditional={wrapperStyle !== undefined} style={wrapperStyle}>
    <RCSelect
      {...props}
      components={{ Option, ...props.components }}
      className={classNames("react-select-container", props.className, { borderless })}
      classNamePrefix={"react-select"}
    />
  </ConditionalWrapper>
);

export default React.memo(Select) as typeof Select;

import React from "react";
import { GroupBase } from "react-select";
import RCAsyncSelect, { AsyncProps } from "react-select/async";
import classNames from "classnames";

export type AsyncSelectProps<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
> = AsyncProps<Option, IsMulti, Group> & {
  readonly borderless?: boolean;
};

const AsyncSelect = <O, M extends boolean = false, G extends GroupBase<O> = GroupBase<O>>({
  borderless,
  ...props
}: AsyncSelectProps<O, M, G>): JSX.Element => (
  <RCAsyncSelect
    cacheOptions={true}
    {...props}
    className={classNames("react-select-container", props.className, { borderless })}
    classNamePrefix={"react-select"}
  />
);

export default React.memo(AsyncSelect) as typeof AsyncSelect;

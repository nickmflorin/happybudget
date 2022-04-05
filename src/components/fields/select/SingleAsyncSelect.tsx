import React from "react";
import { GroupBase } from "react-select";

import AsyncSelect, { AsyncSelectProps } from "./AsyncSelect";

export type SingleAsyncSelectProps<Option, Group extends GroupBase<Option> = GroupBase<Option>> = Omit<
  AsyncSelectProps<Option, false, Group>,
  "isMulti"
>;

const SingleAsyncSelect = <O, G extends GroupBase<O> = GroupBase<O>>(
  props: SingleAsyncSelectProps<O, G>
): JSX.Element => <AsyncSelect {...props} isMulti={false} />;

export default React.memo(SingleAsyncSelect) as typeof SingleAsyncSelect;

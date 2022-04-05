import React from "react";
import { GroupBase } from "react-select";

import AsyncSelect, { AsyncSelectProps } from "./AsyncSelect";

export type MultiAsyncSelectProps<Option, Group extends GroupBase<Option> = GroupBase<Option>> = Omit<
  AsyncSelectProps<Option, true, Group>,
  "isMulti"
>;

const MultiAsyncSelect = <O, G extends GroupBase<O> = GroupBase<O>>(
  props: MultiAsyncSelectProps<O, G>
): JSX.Element => <AsyncSelect {...props} isMulti={true} />;

export default React.memo(MultiAsyncSelect) as typeof MultiAsyncSelect;

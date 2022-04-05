import React from "react";
import { GroupBase } from "react-select";

import Select, { SelectProps } from "./SelectV2";

export type SingleSelectProps<Option, Group extends GroupBase<Option> = GroupBase<Option>> = Omit<
  SelectProps<Option, false, Group>,
  "isMulti"
>;

const SingleSelect = <O, G extends GroupBase<O> = GroupBase<O>>(props: SingleSelectProps<O, G>): JSX.Element => (
  <Select {...props} isMulti={false} />
);

export default React.memo(SingleSelect) as typeof SingleSelect;

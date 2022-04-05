import React from "react";
import { GroupBase } from "react-select";

import Select, { SelectProps } from "./SelectV2";

type MultiSelectProps<Option, Group extends GroupBase<Option> = GroupBase<Option>> = Omit<
  SelectProps<Option, true, Group>,
  "isMulti"
>;

const MultiSelect = <O, G extends GroupBase<O> = GroupBase<O>>(props: MultiSelectProps<O, G>): JSX.Element => (
  <Select {...props} isMulti={true} />
);

export default React.memo(MultiSelect) as typeof MultiSelect;

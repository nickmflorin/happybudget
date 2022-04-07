import React from "react";
import { GroupBase } from "react-select";

import Select, { SelectProps } from "./SelectV2";

export type SingleSelectProps<O extends SelectOption, Group extends GroupBase<O> = GroupBase<O>> = Omit<
  SelectProps<O, false, Group>,
  "isMulti"
>;

const SingleSelect = <O extends SelectOption, G extends GroupBase<O> = GroupBase<O>>(
  props: SingleSelectProps<O, G>
): JSX.Element => <Select isSearchable={false} {...props} isMulti={false} />;

export default React.memo(SingleSelect) as typeof SingleSelect;

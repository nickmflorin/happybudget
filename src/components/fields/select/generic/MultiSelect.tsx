import React from "react";

import MultiValue from "./multivalue/MultiValue";
import Select, { SelectProps } from "./Select";

export type MultiSelectProps<O extends SelectOption, G extends SelectGroupBase<O> = SelectGroupBase<O>> = Omit<
  SelectProps<O, true, G>,
  "isMulti"
>;

const MultiSelect = <O extends SelectOption, G extends SelectGroupBase<O> = SelectGroupBase<O>>(
  props: MultiSelectProps<O, G>
): JSX.Element => <Select {...props} components={{ MultiValue, ...props.components }} isMulti={true} />;

export default React.memo(MultiSelect) as typeof MultiSelect;

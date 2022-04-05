import React from "react";
import SingleModelSelect, { SingleModelSelectProps } from "./SingleModelSelect";

export type SingleChoiceSelectProps<
  C extends Model.Choice<I, N>,
  I extends number = number,
  N extends string = string
> = Omit<SingleModelSelectProps<C>, "getOptionLabel"> & {
  // Optional, because for a choice we have access to the name property.
  readonly getOptionLabel?: (m: C) => string;
};

const SingleChoiceSelect = <C extends Model.Choice<I, N>, I extends number = number, N extends string = string>(
  props: SingleChoiceSelectProps<C, I, N>
): JSX.Element => (
  <SingleModelSelect<C> isClearable={false} isSearchable={false} getOptionLabel={(m: C) => m.name} {...props} />
);

export default React.memo(SingleChoiceSelect) as typeof SingleChoiceSelect;

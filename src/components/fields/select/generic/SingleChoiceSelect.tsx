import React from "react";

import SingleModelSyncSelect, { SingleModelSyncSelectProps } from "./SingleModelSyncSelect";

export type SingleChoiceSelectProps<
  C extends Model.Choice<I, N, S>,
  I extends number = number,
  N extends string = string,
  S extends string = string,
> = Omit<SingleModelSyncSelectProps<C>, "getOptionLabel"> & {
  // Optional, because for a choice we have access to the name property.
  readonly getOptionLabel?: (m: C) => string;
};

const SingleChoiceSelect = <
  C extends Model.Choice<I, N, S>,
  I extends number = number,
  N extends string = string,
  S extends string = string,
>(
  props: SingleChoiceSelectProps<C, I, N, S>,
): JSX.Element => (
  <SingleModelSyncSelect<C>
    isClearable={false}
    isSearchable={false}
    getOptionLabel={(m: C) => m.name}
    {...props}
  />
);

export default React.memo(SingleChoiceSelect) as typeof SingleChoiceSelect;

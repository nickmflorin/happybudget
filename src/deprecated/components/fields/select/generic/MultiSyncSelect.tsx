import React from "react";

import { GroupBase } from "react-select";

import MultiSelect, { MultiSelectProps } from "./MultiSelect";

export type MultiSyncSelectProps<
  O extends SelectOption,
  Group extends GroupBase<O> = GroupBase<O>,
> = Omit<MultiSelectProps<O, Group>, "isMulti">;

const MultiSyncSelect = <O extends SelectOption, G extends GroupBase<O> = GroupBase<O>>(
  props: MultiSyncSelectProps<O, G>,
): JSX.Element => <MultiSelect isSearchable={false} {...props} />;

export default React.memo(MultiSyncSelect) as typeof MultiSyncSelect;

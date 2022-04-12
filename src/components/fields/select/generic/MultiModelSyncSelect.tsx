import React from "react";
import { GroupBase } from "react-select";

import MultiSyncSelect, { MultiSyncSelectProps } from "./MultiSyncSelect";
import * as hocs from "./hocs";

type BaseProps<
  M extends Model.Model,
  G extends GroupBase<ModelSelectOption<M>> = GroupBase<ModelSelectOption<M>>
> = Omit<
  MultiSyncSelectProps<ModelSelectOption<M>, G>,
  "getOptionLabel" | "getOptionValue" | "onChange" | "options" | "value"
>;

type _MultiModelSyncSelectProps<
  M extends Model.Model,
  G extends GroupBase<ModelSelectOption<M>> = GroupBase<ModelSelectOption<M>>
> = BaseProps<M, G> & hocs.MultiModelSelectInjectedProps<M> & hocs.MultiModelSyncSelectInjectedProps<M>;

export type MultiModelSyncSelectProps<
  M extends Model.Model,
  G extends GroupBase<ModelSelectOption<M>> = GroupBase<ModelSelectOption<M>>
> = BaseProps<M, G> & hocs.WithMultiModelSelectProps<M> & hocs.WithMultiModelSyncSelectProps<M>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const WithMulti = hocs.withMultiModelSelect<any, any, _MultiModelSyncSelectProps<any, any>>(MultiSyncSelect);
const WithSync = hocs.withMultiModelSyncSelect(WithMulti);

export default React.memo(WithSync) as <
  M extends Model.Model,
  G extends GroupBase<ModelSelectOption<M>> = GroupBase<ModelSelectOption<M>>
>(
  props: MultiModelSyncSelectProps<M, G>
) => JSX.Element;

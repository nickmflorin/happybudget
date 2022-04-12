import React from "react";

import MultiAsyncSelect, { MultiAsyncSelectProps } from "./MultiAsyncSelect";
import * as hocs from "./hocs";

type BaseProps<
  M extends Model.Model,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>
> = Omit<
  MultiAsyncSelectProps<ModelSelectOption<M>, Http.ListResponse<M>, G>,
  "getOptionLabel" | "getOptionValue" | "onChange" | "options" | "value"
>;

type _MultiModelAsyncSelectProps<
  M extends Model.Model,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>
> = BaseProps<M, G> & hocs.MultiModelSelectInjectedProps<M> & hocs.MultiModelAsyncSelectInjectedProps<M>;

export type MultiModelAsyncSelectProps<
  M extends Model.Model,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>
> = BaseProps<M, G> & hocs.WithMultiModelSelectProps<M> & hocs.WithMultiModelAsyncSelectProps<M>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const WithMulti = hocs.withMultiModelSelect<any, any, _MultiModelAsyncSelectProps<any, any>>(MultiAsyncSelect);
const WithAsync = hocs.withMultiModelAsyncSelect(WithMulti);

export default React.memo(WithAsync) as <
  M extends Model.Model,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>
>(
  props: MultiModelAsyncSelectProps<M, G>
) => JSX.Element;

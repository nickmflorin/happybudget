import React from "react";

import MultiAsyncSelect, { MultiAsyncSelectProps } from "./MultiAsyncSelect";
import {
  withMultiModelSelect,
  withMultiModelAsyncSelect,
  WithMultiModelSelectProps,
  WithMultiModelAsyncSelectProps,
  MultiModelSelectInjectedProps,
  MultiModelAsyncSelectInjectedProps
} from "./hocs";

type BaseProps<
  M extends Model.Model,
  G extends AsyncSelectGroupBase<AsyncModelSelectOption<M>> = AsyncSelectGroupBase<AsyncModelSelectOption<M>>
> = Omit<
  MultiAsyncSelectProps<AsyncModelSelectOption<M>, Http.ListResponse<M>, G>,
  "getOptionLabel" | "getOptionValue" | "onChange" | "options" | "value"
>;

type _MultiModelAsyncSelectProps<
  M extends Model.Model,
  G extends AsyncSelectGroupBase<AsyncModelSelectOption<M>> = AsyncSelectGroupBase<AsyncModelSelectOption<M>>
> = BaseProps<M, G> & MultiModelSelectInjectedProps<M> & MultiModelAsyncSelectInjectedProps<M>;

export type MultiModelAsyncSelectProps<
  M extends Model.Model,
  G extends AsyncSelectGroupBase<AsyncModelSelectOption<M>> = AsyncSelectGroupBase<AsyncModelSelectOption<M>>
> = BaseProps<M, G> & WithMultiModelSelectProps<M> & WithMultiModelAsyncSelectProps<M>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const WithMulti = withMultiModelSelect<any, _MultiModelAsyncSelectProps<any, any>>(MultiAsyncSelect);
const WithAsync = withMultiModelAsyncSelect(WithMulti);

export default React.memo(WithAsync) as <
  M extends Model.Model,
  G extends AsyncSelectGroupBase<AsyncModelSelectOption<M>> = AsyncSelectGroupBase<AsyncModelSelectOption<M>>
>(
  props: MultiModelAsyncSelectProps<M, G>
) => JSX.Element;

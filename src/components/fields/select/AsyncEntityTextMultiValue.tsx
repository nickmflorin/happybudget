import React from "react";

import { withAsyncMultiValue, AsyncMultiValueProps } from "./AsyncMultiValue";
import EntityTextMultiValue from "./EntityTextMultiValue";

export type AsyncEntityTextMultiValueProps<
  M extends Model.HttpModel,
  G extends AsyncSelectGroupBase<AsyncModelSelectOption<M>> = AsyncSelectGroupBase<AsyncModelSelectOption<M>>
> = AsyncMultiValueProps<AsyncModelSelectOption<M>, G>;

const AsyncEntityTextMultiValue = withAsyncMultiValue<ModelSelectOption<Model.HttpModel>>(EntityTextMultiValue);

export default React.memo(AsyncEntityTextMultiValue) as <
  M extends Model.HttpModel,
  G extends AsyncSelectGroupBase<AsyncModelSelectOption<M>> = AsyncSelectGroupBase<AsyncModelSelectOption<M>>
>(
  props: AsyncEntityTextMultiValueProps<M, G>
) => JSX.Element;

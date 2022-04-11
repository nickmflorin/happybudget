import React from "react";

import { withAsyncOption, AsyncOptionProps } from "./AsyncOption";
import EntityTextOption from "./EntityTextOption";

export type AsyncEntityTextOptionProps<
  M extends Model.HttpModel,
  IsMulti extends boolean = true,
  G extends AsyncSelectGroupBase<AsyncModelSelectOption<M>> = AsyncSelectGroupBase<AsyncModelSelectOption<M>>
> = AsyncOptionProps<AsyncModelSelectOption<M>, IsMulti, G>;

const AsyncEntityTextOption = withAsyncOption<ModelSelectOption<Model.HttpModel>>(EntityTextOption);

export default React.memo(AsyncEntityTextOption) as <
  M extends Model.HttpModel,
  IsMulti extends boolean = true,
  G extends AsyncSelectGroupBase<AsyncModelSelectOption<M>> = AsyncSelectGroupBase<AsyncModelSelectOption<M>>
>(
  props: AsyncEntityTextOptionProps<M, IsMulti, G>
) => JSX.Element;

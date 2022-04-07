import React from "react";

import { ui } from "lib";

import MultiValue, { MultiValueProps } from "./MultiValue";

export type AsyncMultiValueProps<
  O extends SelectOption,
  G extends AsyncSelectGroupBase<O> = AsyncSelectGroupBase<O>
> = MultiValueProps<AsyncSelectOption<O>, G>;

const AsyncMultiValue = <O extends SelectOption, G extends AsyncSelectGroupBase<O> = AsyncSelectGroupBase<O>>(
  props: AsyncMultiValueProps<O, G>
): JSX.Element => (ui.select.isSelectErrorOption(props.data) ? <></> : <MultiValue {...props} />);

export default React.memo(AsyncMultiValue) as typeof AsyncMultiValue;

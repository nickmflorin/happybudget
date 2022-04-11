import React from "react";

import { ui } from "lib";

import MultiValue, { MultiValueProps } from "./MultiValue";

export const withAsyncMultiValue = <
  O extends SelectOption,
  AO extends AsyncSelectOption<O> = AsyncSelectOption<O>,
  G extends SelectGroupBase<O> = SelectGroupBase<O>,
  T extends MultiValueProps<O, G> = MultiValueProps<O, G>
>(
  Component: React.FunctionComponent<T>
): React.FunctionComponent<MultiValueProps<AO, SelectGroupBase<AO>>> => {
  const WithAsync = (props: MultiValueProps<AO, SelectGroupBase<AO>>): JSX.Element => {
    return ui.select.isSelectErrorOption(props.data) ? <></> : <Component {...(props as unknown as T)} />;
  };
  return WithAsync;
};

export type AsyncMultiValueProps<
  O extends SelectOption,
  G extends AsyncSelectGroupBase<O> = AsyncSelectGroupBase<O>
> = MultiValueProps<AsyncSelectOption<O>, G>;

const AsyncMultiValue = withAsyncMultiValue(MultiValue);

export default React.memo(AsyncMultiValue) as <
  O extends SelectOption,
  G extends AsyncSelectGroupBase<O> = AsyncSelectGroupBase<O>
>(
  props: AsyncMultiValueProps<O, G>
) => JSX.Element;

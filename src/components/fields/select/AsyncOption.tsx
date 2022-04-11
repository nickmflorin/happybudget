import React, { ReactNode } from "react";

import { ui } from "lib";
import { Error } from "components/notifications";

import Option, { OptionProps, OptionChildrenRenderProps } from "./Option";

export const withAsyncOption = <
  O extends SelectOption,
  AO extends AsyncSelectOption<O> = AsyncSelectOption<O>,
  M extends boolean = false,
  G extends SelectGroupBase<O> = SelectGroupBase<O>,
  T extends OptionProps<O, M, G> = OptionProps<O, M, G>
>(
  Component: React.FunctionComponent<T>
): React.FunctionComponent<OptionProps<AO, M, SelectGroupBase<AO>>> => {
  const WithAsync = (props: OptionProps<AO, M, SelectGroupBase<AO>>): JSX.Element => {
    return ui.select.isSelectErrorOption(props.data) ? (
      <Option {...props}>
        <Error message={props.data.message} detail={props.data.detail} bare={true} />
      </Option>
    ) : (
      <Component {...(props as unknown as T)} />
    );
  };
  return WithAsync;
};

export type AsyncOptionProps<
  O extends SelectOption,
  M extends boolean = false,
  G extends AsyncSelectGroupBase<O> = AsyncSelectGroupBase<O>
> = Omit<OptionProps<AsyncSelectOption<O>, M, G>, "children"> & {
  /* Override such that the option in the render callback is not an AsyncOption.
     This is because the AsyncOption only adds the inclusion of SelectErrorOption,
     but we filter the SelectErrorOption out before the callback is performed. */
  readonly children: ReactNode | ((params: OptionChildrenRenderProps<O, M, SelectGroupBase<O>>) => JSX.Element);
};

const AsyncOption = withAsyncOption(Option);

export default React.memo(AsyncOption) as <
  O extends SelectOption,
  M extends boolean = false,
  G extends AsyncSelectGroupBase<O> = AsyncSelectGroupBase<O>
>(
  props: AsyncOptionProps<O, M, G>
) => JSX.Element;

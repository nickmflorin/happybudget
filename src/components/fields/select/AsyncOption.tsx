import React, { ReactNode } from "react";

import { ui } from "lib";

import Option, { OptionProps, OptionChildrenRenderProps } from "./Option";

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

const AsyncOption = <
  O extends SelectOption,
  M extends boolean = false,
  G extends AsyncSelectGroupBase<O> = AsyncSelectGroupBase<O>
>(
  props: OptionProps<AsyncSelectOption<O>, M, G>
): JSX.Element =>
  ui.select.isSelectErrorOption(props.data) ? (
    <Option {...props}>
      <div style={{ display: "flex" }}>
        {props.data.message}
        {props.data.detail}
      </div>
    </Option>
  ) : (
    <Option {...props} />
  );

export default React.memo(AsyncOption) as typeof AsyncOption;

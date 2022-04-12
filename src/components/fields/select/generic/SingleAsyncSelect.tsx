import React from "react";

import AsyncSelect, { AsyncSelectProps } from "./AsyncSelect";

export type SingleAsyncSelectProps<
  O extends SelectOption,
  RSP extends Http.ListResponse<unknown> = Http.ListResponse<unknown>,
  G extends SelectGroupBase<O> = SelectGroupBase<O>
> = Omit<AsyncSelectProps<O, false, RSP, G>, "isMulti">;

const SingleAsyncSelect = <
  O extends SelectOption,
  RSP extends Http.ListResponse<unknown> = Http.ListResponse<unknown>,
  G extends SelectGroupBase<O> = SelectGroupBase<O>
>(
  props: SingleAsyncSelectProps<O, RSP, G>
): JSX.Element => <AsyncSelect {...props} isMulti={false} />;

export default React.memo(SingleAsyncSelect) as typeof SingleAsyncSelect;

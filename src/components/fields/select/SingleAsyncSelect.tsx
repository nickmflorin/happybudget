import React from "react";

import AsyncSelect, { AsyncSelectProps } from "./AsyncSelect";

export type SingleAsyncSelectProps<
  O,
  RSP extends Http.ListResponse<unknown> = Http.ListResponse<unknown>,
  G extends AsyncSelectGroupBase<O> = AsyncSelectGroupBase<O>
> = Omit<AsyncSelectProps<O, false, RSP, G>, "isMulti">;

const SingleAsyncSelect = <
  O,
  RSP extends Http.ListResponse<unknown> = Http.ListResponse<unknown>,
  G extends AsyncSelectGroupBase<O> = AsyncSelectGroupBase<O>
>(
  props: SingleAsyncSelectProps<O, RSP, G>
): JSX.Element => <AsyncSelect {...props} isMulti={false} />;

export default React.memo(SingleAsyncSelect) as typeof SingleAsyncSelect;

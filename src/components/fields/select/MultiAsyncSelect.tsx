import React from "react";

import AsyncSelect, { AsyncSelectProps } from "./AsyncSelect";

export type MultiAsyncSelectProps<
  O,
  RSP extends Http.ListResponse<unknown> = Http.ListResponse<unknown>,
  G extends AsyncSelectGroupBase<O> = AsyncSelectGroupBase<O>
> = Omit<AsyncSelectProps<O, true, RSP, G>, "isMulti">;

const MultiAsyncSelect = <
  O,
  RSP extends Http.ListResponse<unknown> = Http.ListResponse<unknown>,
  G extends AsyncSelectGroupBase<O> = AsyncSelectGroupBase<O>
>(
  props: MultiAsyncSelectProps<O, RSP, G>
): JSX.Element => <AsyncSelect {...props} isMulti={true} />;

export default MultiAsyncSelect;

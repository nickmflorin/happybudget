import AsyncSelect, { AsyncSelectProps } from "./AsyncSelect";
import AsyncMultiValue from "./AsyncMultiValue";

export type MultiAsyncSelectProps<
  O extends SelectOption,
  RSP extends Http.ListResponse<unknown> = Http.ListResponse<unknown>,
  G extends AsyncSelectGroupBase<O> = AsyncSelectGroupBase<O>
> = Omit<AsyncSelectProps<O, true, RSP, G>, "isMulti">;

const MultiAsyncSelect = <
  O,
  RSP extends Http.ListResponse<unknown> = Http.ListResponse<unknown>,
  G extends AsyncSelectGroupBase<O> = AsyncSelectGroupBase<O>
>(
  props: MultiAsyncSelectProps<O, RSP, G>
): JSX.Element => (
  <AsyncSelect {...props} components={{ MultiValue: AsyncMultiValue, ...props.components }} isMulti={true} />
);

export default MultiAsyncSelect;

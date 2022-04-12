import AsyncSelect, { AsyncSelectProps } from "./AsyncSelect";
import { MultiValue } from "./multivalue";

export type MultiAsyncSelectProps<
  O extends SelectOption,
  RSP extends Http.ListResponse<unknown> = Http.ListResponse<unknown>,
  G extends SelectGroupBase<O> = SelectGroupBase<O>
> = Omit<AsyncSelectProps<O, true, RSP, G>, "isMulti">;

const MultiAsyncSelect = <
  O,
  RSP extends Http.ListResponse<unknown> = Http.ListResponse<unknown>,
  G extends SelectGroupBase<O> = SelectGroupBase<O>
>(
  props: MultiAsyncSelectProps<O, RSP, G>
): JSX.Element => <AsyncSelect {...props} components={{ MultiValue, ...props.components }} isMulti={true} />;

export default MultiAsyncSelect;

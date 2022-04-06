import { MultiValue } from "react-select/dist/declarations/src/types";
import { map } from "lodash";

import { ui } from "lib";

import MultiAsyncSelect, { MultiAsyncSelectProps } from "./MultiAsyncSelect";

export const convertOptions = <M extends Model.Model>(options: MultiValue<Model.WithStringId<M>>): M["id"][] =>
  map(options, (o: Model.WithStringId<M>) => ui.select.toSelectModel(o).id);

export type MultiModelAsyncSelectProps<
  M extends Model.Model,
  G extends AsyncSelectGroupBase<Model.WithStringId<M>> = AsyncSelectGroupBase<Model.WithStringId<M>>
> = Omit<
  MultiAsyncSelectProps<Model.WithStringId<M>, Http.ListResponse<M>, G>,
  "getOptionLabel" | "getOptionValue" | "onChange" | "options" | "value"
> & {
  readonly onChange?: (ms: M["id"][]) => void;
  readonly getOptionLabel?: (m: M) => string;
  readonly value?: M["id"][];
};

const MultiModelAsyncSelect = <
  M extends Model.Model,
  G extends AsyncSelectGroupBase<Model.WithStringId<M>> = AsyncSelectGroupBase<Model.WithStringId<M>>
>({
  value,
  getOptionLabel,
  ...props
}: MultiModelAsyncSelectProps<M, G>): JSX.Element => {
  const { value: v, onResponse } = ui.select.useMultiModelSelect<M>({ value, isAsync: true });

  return (
    <MultiAsyncSelect
      {...props}
      defaultOptions={true}
      value={v}
      processResponse={(rsp: Http.ListResponse<M>) => map(rsp.data, (d: M) => ui.select.toSelectOption(d))}
      onResponse={onResponse}
      getOptionLabel={(mS: Model.WithStringId<M>) => getOptionLabel?.(ui.select.toSelectModel(mS)) || ""}
      getOptionValue={(m: Model.WithStringId<M>) => m.id}
      onChange={(newValue: MultiValue<Model.WithStringId<M>>) => props.onChange?.(convertOptions(newValue))}
    />
  );
};

export default MultiModelAsyncSelect;

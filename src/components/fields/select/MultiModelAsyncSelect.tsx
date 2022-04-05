import { useMemo, useState } from "react";
import { MultiValue } from "react-select/dist/declarations/src/types";
import { map, filter } from "lodash";

import MultiAsyncSelect, { MultiAsyncSelectProps } from "./MultiAsyncSelect";
import { useModelSelect } from "./hooks";

export type MultiModelAsyncSelectProps<
  M extends Model.Model,
  G extends AsyncSelectGroupBase<Model.WithStringId<M>> = AsyncSelectGroupBase<Model.WithStringId<M>>
> = Omit<
  MultiAsyncSelectProps<Model.WithStringId<M>, Http.ListResponse<M>, G>,
  "getOptionLabel" | "getOptionValue" | "onChange" | "options" | "value"
> & {
  readonly onChange?: (ms: M[]) => void;
  readonly getOptionLabel: (m: M) => string;
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
  const [data, setData] = useState<M[]>([]);
  const { retrieve, toModel, toOption } = useModelSelect(data);

  const convertValue = useMemo(
    () =>
      (v: M["id"][]): MultiValue<Model.WithStringId<M>> =>
        map(
          filter(
            map(v, (id: M["id"]) => retrieve(id)),
            (m: M | undefined) => m !== undefined
          ) as M[],
          (m: M) => toOption(m)
        ),
    [retrieve, toOption]
  );

  const convertOptions = useMemo(
    () =>
      (options: MultiValue<Model.WithStringId<M>>): M[] =>
        map(options, (o: Model.WithStringId<M>) => toModel(o)),
    [toModel]
  );

  return (
    <MultiAsyncSelect
      {...props}
      value={value === undefined ? value : convertValue(value)}
      processResponse={(rsp: Http.ListResponse<M>) => map(rsp.data, (d: M) => toOption(d))}
      onResponse={(rsp: Http.ListResponse<M>) => setData(rsp.data)}
      getOptionLabel={(mS: Model.WithStringId<M>) => getOptionLabel(toModel(mS))}
      getOptionValue={(m: Model.WithStringId<M>) => m.id}
      onChange={(newValue: MultiValue<Model.WithStringId<M>>) => props.onChange?.(convertOptions(newValue))}
    />
  );
};

export default MultiModelAsyncSelect;

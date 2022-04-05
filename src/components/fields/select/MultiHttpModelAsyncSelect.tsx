import { useMemo, useState } from "react";
import { MultiValue } from "react-select/dist/declarations/src/types";
import { map, find, isNil, filter } from "lodash";

import MultiAsyncSelect, { MultiAsyncSelectProps } from "./MultiAsyncSelect";

export type MultiHttpModelAsyncSelectProps<M extends Model.HttpModel> = Omit<
  MultiAsyncSelectProps<Model.WithStringId<M>>,
  "loadOptions" | "getOptionLabel" | "getOptionValue" | "onChange" | "options" | "value"
> & {
  readonly onChange?: (ms: M[]) => void;
  readonly getOptionLabel: (m: M) => string;
  readonly value?: M["id"][];
  readonly loadOptions: (inputValue: string) => Promise<Http.ListResponse<M>>;
};

const MultiHttpModelAsyncSelect = <M extends Model.HttpModel>({
  value,
  loadOptions,
  getOptionLabel,
  ...props
}: MultiHttpModelAsyncSelectProps<M>): JSX.Element => {
  const [data, setData] = useState<M[]>([]);

  const _loadOptions = useMemo(
    () => (inputValue: string) => {
      return new Promise<Model.WithStringId<M>[]>((resolve, reject) => {
        loadOptions(inputValue)
          .then((r: Http.ListResponse<M>) => {
            setData(r.data);
            resolve(map(r.data, (m: M) => ({ ...m, id: String(m.id) })));
          })
          .catch((e: Error) => reject(e));
      });
    },
    [loadOptions]
  );

  const retrieve = useMemo(
    () =>
      (id: M["id"]): M | undefined => {
        const m: M | undefined = find(data, { id }) as M | undefined;
        if (m === undefined) {
          console.warn(`Could not parse select model from data for ID ${id}.`);
          return undefined;
        }
        return m;
      },
    [data]
  );

  const toOption = useMemo(
    () =>
      (m: M): Model.WithStringId<M> => ({ ...m, id: String(m.id) }),
    []
  );

  const toModel = useMemo(
    () =>
      (m: Model.WithStringId<M> | null): M | null =>
        m === null ? null : ({ ...m, id: parseInt(m.id) } as M),
    []
  );

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
        map(options, (o: Model.WithStringId<M>) => toModel(o) as M),
    [toModel]
  );

  return (
    <MultiAsyncSelect
      {...props}
      value={value === undefined ? value : convertValue(value)}
      loadOptions={_loadOptions}
      getOptionLabel={(mS: Model.WithStringId<M> | null) => {
        const m = toModel(mS);
        if (!isNil(m)) {
          return getOptionLabel(m);
        }
        return "";
      }}
      getOptionValue={(m: Model.WithStringId<M>) => m.id}
      onChange={(newValue: MultiValue<Model.WithStringId<M>>) => props.onChange?.(convertOptions(newValue))}
    />
  );
};

export default MultiHttpModelAsyncSelect;

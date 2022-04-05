import React, { useMemo } from "react";
import { SingleValue } from "react-select/dist/declarations/src/types";
import { map, find, isNil } from "lodash";

import SingleSelect, { SingleSelectProps } from "./SingleSelect";

export type SingleHttpModelSelectProps<M extends Model.HttpModel> = Omit<
  SingleSelectProps<Model.WithStringId<M>>,
  "getOptionLabel" | "getOptionValue" | "options" | "value" | "defaultValue" | "onChange"
> & {
  readonly options: M[];
  readonly value: M["id"] | null;
  readonly defaultValue?: M["id"] | null;
  readonly onChange?: (ms: M | null) => void;
  readonly getOptionLabel: (m: M) => string;
};

const SingleHttpModelSelect = <M extends Model.HttpModel>({
  getOptionLabel,
  ...props
}: SingleHttpModelSelectProps<M>): JSX.Element => {
  const retrieve = useMemo(
    () =>
      (id: M["id"] | null): M | null | undefined => {
        if (id === null) {
          return null;
        }
        const m: M | undefined = find(props.options, { id }) as M | undefined;
        if (m === undefined) {
          console.warn(`Could not parse select model from data for ID ${id}.`);
          return undefined;
        }
        return m;
      },
    [props.options]
  );

  const toModel = useMemo(
    () =>
      (m: SingleValue<Model.WithStringId<M>>): M | null =>
        m === null ? null : ({ ...m, id: parseInt(m.id) } as M),
    [props.options]
  );

  const toOption = useMemo(
    () =>
      (m: M | null): Model.WithStringId<M> | null =>
        m === null ? null : { ...m, id: String(m.id) },
    []
  );

  const convertValue = useMemo(
    () =>
      (v: M["id"] | null): Model.WithStringId<M> | null | undefined => {
        const m = retrieve(v);
        return m === undefined ? undefined : toOption(m);
      },
    []
  );

  return (
    <SingleSelect<Model.WithStringId<M>>
      {...props}
      defaultValue={props.defaultValue === undefined ? undefined : convertValue(props.defaultValue)}
      value={convertValue(props.value)}
      options={map(props.options, (o: M) => ({ ...o, id: String(o.id) })) as Model.WithStringId<M>[]}
      getOptionLabel={(mI: Model.WithStringId<M>) => {
        const m = toModel(mI);
        if (!isNil(m)) {
          return getOptionLabel(m);
        }
        return "";
      }}
      getOptionValue={(m: Model.WithStringId<M>) => m.id}
      onChange={(newValue: SingleValue<Model.WithStringId<M>>) => props.onChange?.(toModel(newValue))}
    />
  );
};

export default React.memo(SingleHttpModelSelect) as typeof SingleHttpModelSelect;

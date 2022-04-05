import React, { useMemo } from "react";
import { SingleValue } from "react-select/dist/declarations/src/types";
import { map } from "lodash";

import SingleSelect, { SingleSelectProps } from "./SingleSelect";
import { useModelSelect } from "./hooks";

export type SingleModelSelectProps<M extends Model.Model> = Omit<
  SingleSelectProps<Model.WithStringId<M>>,
  "getOptionLabel" | "getOptionValue" | "options" | "value" | "defaultValue" | "onChange"
> & {
  readonly options: M[];
  readonly value: M["id"] | null;
  readonly defaultValue?: M["id"] | null;
  readonly onChange?: (ms: M | null) => void;
  readonly getOptionLabel: (m: M) => string;
};

const SingleModelSelect = <M extends Model.Model>({
  getOptionLabel,
  ...props
}: SingleModelSelectProps<M>): JSX.Element => {
  const { retrieve, toModel, toOption } = useModelSelect(props.options);

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
      getOptionLabel={(mI: Model.WithStringId<M>) => getOptionLabel(toModel(mI))}
      getOptionValue={(m: Model.WithStringId<M>) => m.id}
      onChange={(newValue: SingleValue<Model.WithStringId<M>>) =>
        props.onChange?.(newValue !== null ? toModel(newValue) : newValue)
      }
    />
  );
};

export default React.memo(SingleModelSelect) as typeof SingleModelSelect;

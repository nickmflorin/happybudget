import React, { useMemo } from "react";
import { SingleValue } from "react-select/dist/declarations/src/types";
import { map, find } from "lodash";

import { ui } from "lib";

import SingleSelect, { SingleSelectProps } from "./SingleSelect";

export type SingleModelSelectProps<M extends Model.Model> = Omit<
  SingleSelectProps<Model.WithStringId<M>>,
  "getOptionLabel" | "getOptionValue" | "options" | "value" | "defaultValue" | "onChange"
> & {
  readonly options: M[];
  readonly value?: M["id"] | null;
  readonly defaultValue?: M["id"] | null;
  readonly onChange?: (ms: M | null) => void;
  readonly getOptionLabel: (m: M) => string;
};

const SingleModelSelect = <M extends Model.Model>({
  getOptionLabel,
  ...props
}: SingleModelSelectProps<M>): JSX.Element => {
  const retrieve = useMemo(
    () =>
      (id: M["id"] | null): M | undefined => {
        const m: M | undefined = find(props.options, { id }) as M | undefined;
        if (m === undefined) {
          console.warn(`Could not parse select model from data for ID ${id}.`);
          return undefined;
        }
        return m;
      },
    [props.options]
  );

  const convertValue = useMemo(
    () =>
      (v: M["id"] | null): Model.WithStringId<M> | null | undefined => {
        const m = retrieve(v);
        return m === undefined ? undefined : ui.toSelectOption(m);
      },
    []
  );

  return (
    <SingleSelect<Model.WithStringId<M>>
      {...props}
      defaultValue={props.defaultValue === undefined ? undefined : convertValue(props.defaultValue)}
      value={props.value === undefined ? undefined : convertValue(props.value)}
      options={map(props.options, (o: M) => ({ ...o, id: String(o.id) })) as Model.WithStringId<M>[]}
      getOptionLabel={(mI: Model.WithStringId<M>) => getOptionLabel(ui.toSelectModel(mI))}
      getOptionValue={(m: Model.WithStringId<M>) => m.id}
      onChange={(newValue: SingleValue<Model.WithStringId<M>>) =>
        props.onChange?.(newValue !== null ? ui.toSelectModel(newValue) : newValue)
      }
    />
  );
};

export default React.memo(SingleModelSelect) as typeof SingleModelSelect;

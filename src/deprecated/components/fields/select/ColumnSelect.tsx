import React from "react";

import { map, find, isNil } from "lodash";

import { tabling } from "lib";

import { MultiModelSyncSelect, MultiModelSyncSelectProps } from "./generic";

type ColumnModel<
  R extends Table.RowData,
  M extends model.RowTypedApiModel,
  C extends Table.DataColumn<R, M> = Table.DataColumn<R, M>,
> = C & {
  readonly id: C["field"];
  readonly icon?: IconOrElement;
};

type ColumnSelectProps<
  R extends Table.RowData,
  M extends model.RowTypedApiModel,
  C extends Table.DataColumn<R, M> = Table.DataColumn<R, M>,
> = Omit<MultiModelSyncSelectProps<ColumnModel<R, M, C>>, "getOptionLabel" | "options"> & {
  readonly options: C[];
  readonly getOptionLabel?: (c: C) => string;
};

const toModel = <
  R extends Table.RowData,
  M extends model.RowTypedApiModel,
  C extends Table.DataColumn<R, M> = Table.DataColumn<R, M>,
>(
  c: C,
): ColumnModel<R, M, C> => {
  const colType: Table.ColumnDataType | undefined = !isNil(c.dataType)
    ? find(tabling.columns.ColumnTypes, { id: c.dataType })
    : undefined;
  return { ...c, id: c.field, icon: colType?.icon };
};

const ColumnSelect = <
  R extends Table.RowData,
  M extends model.RowTypedApiModel,
  C extends Table.DataColumn<R, M> = Table.DataColumn<R, M>,
>(
  props: ColumnSelectProps<R, M, C>,
) => (
  <MultiModelSyncSelect
    placeholder="Select columns..."
    getOptionLabel={(m: ColumnModel<R, M, C>) =>
      !isNil(props.getOptionLabel) ? props.getOptionLabel(m) : m.headerName || ""
    }
    {...props}
    options={map(props.options, (o: C) => toModel<R, M, C>(o))}
  />
);

export default React.memo(ColumnSelect) as typeof ColumnSelect;

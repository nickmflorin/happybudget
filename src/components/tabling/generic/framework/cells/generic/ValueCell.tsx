import React from "react";

import Cell from "./Cell";

const ValueCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  V extends string | number | null = string | number | null,
  CL extends Table.DataColumn<R, M> = Table.DataColumn<R, M>,
>({
  value,
  ...props
}: Table.ValueCellProps<R, M, C, S, V, CL>): JSX.Element => (
  <Cell<R, M, C, S, V, CL> {...props}>{value}</Cell>
);

export default React.memo(ValueCell) as typeof ValueCell;

import React from "react";
import Cell from "./Cell";

/* eslint-disable indent */
const ValueCell = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>({
  value,
  ...props
}: Table.ValueCellProps<R, M, G, S>): JSX.Element => {
  return <Cell<R, M, G, S> {...props}>{value}</Cell>;
};

export default React.memo(ValueCell) as typeof ValueCell;

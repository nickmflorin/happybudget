import React from "react";
import Cell from "./Cell";

/* eslint-disable indent */
const ValueCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>({
  value,
  ...props
}: Table.ValueCellProps<R, M, S>): JSX.Element => {
  return <Cell<R, M, S> {...props}>{value}</Cell>;
};

export default React.memo(ValueCell) as typeof ValueCell;

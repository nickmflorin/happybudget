import React from "react";
import Cell from "./Cell";

const ValueCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  V extends string | number | null = string | number | null,
  C extends Table.DataColumn<R, M> = Table.DataColumn<R, M>
>({
  value,
  ...props
}: Table.ValueCellProps<R, M, S, V, C>): JSX.Element => {
  return <Cell<R, M, S, V, C> {...props}>{value}</Cell>;
};

export default React.memo(ValueCell) as typeof ValueCell;

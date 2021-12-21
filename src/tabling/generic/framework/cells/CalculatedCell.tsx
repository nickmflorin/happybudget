import React from "react";

import BodyCell from "./BodyCell";
import connectCellToStore from "./connectCellToStore";

export type CalculatedCellProps<
  R extends Table.RowData = Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> = Table.ValueCellProps<R, M, S, number | null, Table.CalculatedColumn<R, M, number | null>>;

const CalculatedCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  props: CalculatedCellProps<R, M, S>
): JSX.Element => {
  return <BodyCell<R, M, S, number | null, Table.CalculatedColumn<R, M, number | null>> {...props} />;
};

export default connectCellToStore<
  CalculatedCellProps<Table.RowData, Model.RowHttpModel, Redux.TableStore<Table.RowData>>,
  Table.RowData,
  Model.RowHttpModel,
  Redux.TableStore<Table.RowData>,
  number | null,
  Table.CalculatedColumn<Table.RowData, Model.RowHttpModel, number | null>
>(React.memo(CalculatedCell)) as typeof CalculatedCell;

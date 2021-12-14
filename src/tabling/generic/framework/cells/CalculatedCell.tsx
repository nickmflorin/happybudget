import React from "react";

import BodyCell from "./BodyCell";
import connectCellToStore from "./connectCellToStore";

export interface CalculatedCellProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> extends Table.ValueCellProps<R, M, S> {}

/* eslint-disable indent */
const CalculatedCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  props: CalculatedCellProps<R, M, S>
): JSX.Element => {
  return <BodyCell<R, M, S> {...props} />;
};

export default connectCellToStore(React.memo(CalculatedCell)) as typeof CalculatedCell;

import React from "react";

import { ValueCell } from "./generic";
import useFormattedValue from "./useFormattedValue";
import connectCellToStore from "./connectCellToStore";

/* eslint-disable indent */
const BodyCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>({
  value,
  ...props
}: Table.ValueCellProps<R, M, S>): JSX.Element => {
  const formattedValue = useFormattedValue({ value, ...props });
  return <ValueCell<R, M, S> {...props} value={formattedValue} />;
};

export default connectCellToStore(React.memo(BodyCell)) as typeof BodyCell;

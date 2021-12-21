import React from "react";

import { ValueCell } from "./generic";
import useFormattedValue from "./useFormattedValue";
import connectCellToStore from "./connectCellToStore";

const BodyCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  V extends string | number | null = string | number | null,
  C extends Table.DataColumn<R, M, V> = Table.DataColumn<R, M, V>
>({
  value,
  ...props
}: Table.ValueCellProps<R, M, S, V, C>): JSX.Element => {
  const formattedValue = useFormattedValue<R, M, S, V, C>({ value, ...props });
  return <ValueCell<R, M, S, V, C> {...props} value={formattedValue} />;
};

export default connectCellToStore(React.memo(BodyCell)) as typeof BodyCell;

import React from "react";

import { ValueCell } from "./generic";
import useFormattedValue from "./useFormattedValue";
import connectCellToStore from "./connectCellToStore";

const BodyCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  V extends string | number | null = string | number | null,
  CL extends Table.DataColumn<R, M, V> = Table.DataColumn<R, M, V>
>({
  value,
  ...props
}: Table.ValueCellProps<R, M, C, S, V, CL>): JSX.Element => {
  const formattedValue = useFormattedValue<R, M, C, S, V, CL>({ value, ...props });
  return <ValueCell<R, M, C, S, V, CL> {...props} value={formattedValue} />;
};

export default connectCellToStore(React.memo(BodyCell)) as typeof BodyCell;

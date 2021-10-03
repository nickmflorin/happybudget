import { ValueCell } from "./generic";
import useFormattedValue from "./useFormattedValue";
import connectCellToStore from "./connectCellToStore";

/* eslint-disable indent */
const BodyCell = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>({
  value,
  ...props
}: Table.ValueCellProps<R, M, S>): JSX.Element => {
  const formattedValue = useFormattedValue({ value, ...props });
  return <ValueCell<R, M, S> {...props} value={formattedValue} />;
};

export default connectCellToStore(BodyCell) as typeof BodyCell;

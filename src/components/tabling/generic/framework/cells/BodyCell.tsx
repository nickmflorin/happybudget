import { ValueCell } from "./generic";
import useFormattedValue from "./useFormattedValue";
import connectCellToStore from "./connectCellToStore";

/* eslint-disable indent */
const BodyCell = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>({
  value,
  ...props
}: Table.ValueCellProps<R, M, G, S>): JSX.Element => {
  const formattedValue = useFormattedValue({ value, ...props });
  return <ValueCell<R, M, G, S> {...props} value={formattedValue} />;
};

export default connectCellToStore(BodyCell) as typeof BodyCell;

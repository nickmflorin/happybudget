import { ValueCell } from "./generic";
import useFormattedValue from "./useFormattedValue";

/* eslint-disable indent */
const BodyCell = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>({
  value,
  ...props
}: Table.ValueCellProps<R, M, S>): JSX.Element => {
  const formattedValue = useFormattedValue({ value, ...props });
  return <ValueCell<R, M, S> {...props} value={formattedValue} />;
};

export default BodyCell;

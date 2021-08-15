import { ValueCell } from "./generic";
import useFormattedValue from "./useFormattedValue";

const BodyCell = <R extends Table.Row, M extends Model.Model>({
  value,
  ...props
}: Table.ValueCellProps<R, M>): JSX.Element => {
  const formattedValue = useFormattedValue({ value, ...props });
  return <ValueCell<R, M> {...props} value={formattedValue} />;
};

export default BodyCell;

import { ValueCell } from "./generic";

const BodyCell = <R extends Table.Row, M extends Model.Model>(props: Table.ValueCellProps<R, M>): JSX.Element => {
  return <ValueCell<R, M> {...props} />;
};

export default BodyCell;

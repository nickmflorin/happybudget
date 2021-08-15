import Cell from "./Cell";

const ValueCell = <R extends Table.Row, M extends Model.Model>({
  value,
  ...props
}: Table.ValueCellProps<R, M>): JSX.Element => {
  return <Cell<R, M> {...props}>{value}</Cell>;
};

export default ValueCell;

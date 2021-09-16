import Cell, { CellProps } from "./Cell";

const BodyCell = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  props: CellProps<R, M>
): JSX.Element => {
  return <Cell {...props} className={["td", props.className]} textClassName={["td-text", props.textClassName]} />;
};

export default BodyCell;

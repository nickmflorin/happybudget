import Cell, { CellProps } from "./Cell";

const BodyCell = <R extends PdfTable.Row, M extends Model.Model>(props: CellProps<R, M>): JSX.Element => {
  return <Cell {...props} className={["td", props.className]} textClassName={["td-text", props.textClassName]} />;
};

export default BodyCell;

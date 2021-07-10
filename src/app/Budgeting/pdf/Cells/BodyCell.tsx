import Cell, { CellProps } from "./Cell";

const BodyCell = <R extends Table.PdfRow, M extends Model.Model>(props: CellProps<R, M>): JSX.Element => {
  return <Cell {...props} className={["td", props.className]} textClassName={["td-text", props.textClassName]} />;
};

export default BodyCell;

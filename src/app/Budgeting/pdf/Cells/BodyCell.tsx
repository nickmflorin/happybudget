import classNames from "classnames";
import Cell, { CellProps } from "./Cell";

const BodyCell = <R extends Table.PdfRow<C>, M extends Model.Model, C extends Model.Model>(
  props: CellProps<R, M, C>
): JSX.Element => {
  return (
    <Cell
      {...props}
      className={classNames("td", props.className)}
      textClassName={classNames("td-text", props.textClassName)}
    />
  );
};

export default BodyCell;

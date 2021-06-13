import classNames from "classnames";

import Cell, { CellProps } from "./Cell";

const HeaderCell = <R extends Table.PdfRow<C>, M extends Model.Model, C extends Model.Model>(
  props: CellProps<R, M, C>
): JSX.Element => {
  return (
    <Cell
      {...props}
      className={classNames("th", props.className)}
      textClassName={classNames("th-text", props.textClassName)}
      formatting={false}
      isHeader={true}
    />
  );
};

export default HeaderCell;

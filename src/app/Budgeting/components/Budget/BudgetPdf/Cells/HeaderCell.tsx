import classNames from "classnames";

import Cell, { CellProps } from "./Cell";

const HeaderCell = <R extends Table.Row, M extends Model.Model>(props: CellProps<R, M>): JSX.Element => {
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

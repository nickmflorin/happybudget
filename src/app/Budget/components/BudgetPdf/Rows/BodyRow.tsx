import classNames from "classnames";

import { BodyCell } from "../Cells";
import { CellProps } from "../Cells/Cell";
import Row, { RowProps } from "./Row";

const BodyRow = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>({
  cellProps,
  ...props
}: RowProps<R, M> & {
  readonly cellProps?: Omit<CellProps<R, M>, "column" | "colIndex" | "row" | "debug" | "isHeader">;
}): JSX.Element => (
  /* eslint-disable indent */
  <Row
    {...props}
    className={classNames("body-tr", props.className)}
    renderCell={(params: { column: Table.PdfColumn<R, M>; indented: boolean; colIndex: number }) => {
      return (
        <BodyCell<R, M>
          colIndex={params.colIndex}
          column={params.column}
          row={props.row}
          indented={params.indented}
          {...cellProps}
        />
      );
    }}
  />
);

export default BodyRow;

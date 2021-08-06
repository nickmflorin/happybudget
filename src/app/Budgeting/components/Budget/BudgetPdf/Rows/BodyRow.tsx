import classNames from "classnames";

import { BodyCell } from "../Cells";
import { CellProps } from "../Cells/Cell";
import Row, { RowProps } from "./Row";

const BodyRow = <R extends Table.Row, M extends Model.Model>({
  cellProps,
  ...props
}: RowProps<R, M> & {
  readonly cellProps?: Omit<CellProps<R, M>, "column" | "location" | "row" | "debug" | "isHeader">;
}): JSX.Element => (
  /* eslint-disable indent */
  <Row
    {...props}
    className={classNames("body-tr", props.className)}
    renderCell={(params: { column: PdfTable.Column<R, M>; indented: boolean; location: PdfTable.CellLocation }) => {
      return (
        <BodyCell<R, M>
          key={`${params.location.index}-${params.location.colIndex}`}
          location={params.location}
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

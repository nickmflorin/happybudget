import classNames from "classnames";

import { BodyCell } from "../Cells";
import { CellProps } from "../Cells/Cell";
import Row, { RowProps } from "./Row";

const BodyRow = <R extends Table.PdfRow, M extends Model.Model>({
  cellProps,
  ...props
}: RowProps<R, M> & {
  readonly cellProps?: Omit<CellProps<R, M>, "column" | "location" | "row" | "debug" | "isHeader">;
}): JSX.Element => (
  /* eslint-disable indent */
  <Row
    {...props}
    className={classNames("body-tr", props.className)}
    renderCell={(params: { column: Table.PdfColumn<R, M>; location: Table.PdfCellLocation }) => {
      return (
        <BodyCell<R, M>
          key={`${params.location.index}-${params.location.colIndex}`}
          location={params.location}
          column={params.column}
          row={props.row}
          {...cellProps}
        />
      );
    }}
  />
);

export default BodyRow;

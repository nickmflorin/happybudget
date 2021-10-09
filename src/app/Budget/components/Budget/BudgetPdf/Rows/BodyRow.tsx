import classNames from "classnames";

import { BodyCell } from "../Cells";
import { RowExplicitBodyCellProps } from "../Cells/BodyCell";
import Row, { RowProps } from "./Row";

export interface BodyRowProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>
> extends RowProps<R, M> {
  readonly fillBlank?: (c: Table.PdfColumn<R, M>) => boolean;
  readonly row?: RW;
  readonly cellProps?: RowExplicitBodyCellProps<R, M>;
  readonly data: Table.BodyRow<R>[];
}

/* eslint-disable indent */
const BodyRow = <
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>
>({
  cellProps,
  ...props
}: BodyRowProps<R, M, RW>): JSX.Element => (
  /* eslint-disable indent */
  <Row
    {...props}
    className={classNames("body-tr", props.className)}
    renderCell={(params: { column: Table.PdfColumn<R, M>; indented: boolean; colIndex: number }) => {
      return (
        <BodyCell<R, M>
          colIndex={params.colIndex}
          column={params.column}
          indented={params.indented}
          data={props.data}
          row={props.row}
          {...cellProps}
        />
      );
    }}
  />
);

export default BodyRow;

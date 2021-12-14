import classNames from "classnames";

import { BodyCell } from "../cells";
import { RowExplicitBodyCellProps } from "../cells/BodyCell";
import Row, { RowProps } from "./Row";

export interface BodyRowProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
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
  M extends Model.RowHttpModel = Model.RowHttpModel,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>
>({
  cellProps,
  ...props
}: BodyRowProps<R, M, RW>): JSX.Element => (
  <Row
    {...props}
    className={classNames("body-tr", props.className)}
    renderCell={(params: {
      lastChild: boolean;
      firstChild: boolean;
      column: Table.PdfColumn<R, M>;
      indented: boolean;
      colIndex: number;
    }) => {
      return <BodyCell<R, M> {...params} data={props.data} row={props.row} {...cellProps} />;
    }}
  />
);

export default BodyRow;

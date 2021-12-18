import classNames from "classnames";

import { BodyCell } from "../cells";
import { RowExplicitBodyCellProps } from "../cells/BodyCell";
import Row, { RowProps } from "./Row";

export interface BodyRowProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>
> extends RowProps<R, M, C> {
  readonly fillBlank?: (c: C) => boolean;
  readonly row?: RW;
  readonly cellProps?: RowExplicitBodyCellProps<R, M, C>;
  readonly data: Table.BodyRow<R>[];
}

const BodyRow = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>
>({
  cellProps,
  ...props
}: BodyRowProps<R, M, C, RW>): JSX.Element => (
  <Row<R, M, C>
    {...props}
    className={classNames("body-tr", props.className)}
    renderCell={(params: {
      lastChild: boolean;
      firstChild: boolean;
      column: C;
      indented: boolean;
      colIndex: number;
    }) => {
      return <BodyCell<R, M, C> {...params} data={props.data} row={props.row} {...cellProps} />;
    }}
  />
);

export default BodyRow;

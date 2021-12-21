import classNames from "classnames";

import { BodyCell } from "../cells";
import { RowExplicitBodyCellProps } from "../cells/BodyCell";
import Row, { RowProps } from "./Row";

export interface BodyRowProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>
> extends RowProps<R, M, V> {
  readonly fillBlank?: (c: Table.DataColumn<R, M, V>) => boolean;
  readonly row?: RW;
  readonly cellProps?: RowExplicitBodyCellProps<R, M, V>;
  readonly data: Table.BodyRow<R>[];
}

const BodyRow = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>
>({
  cellProps,
  ...props
}: BodyRowProps<R, M, V, RW>): JSX.Element => (
  <Row<R, M, V>
    {...props}
    className={classNames("body-tr", props.className)}
    renderCell={(params: {
      lastChild: boolean;
      firstChild: boolean;
      column: Table.DataColumn<R, M, V>;
      indented: boolean;
      colIndex: number;
    }) => {
      return <BodyCell<R, M, V> {...params} data={props.data} row={props.row} {...cellProps} />;
    }}
  />
);

export default BodyRow;

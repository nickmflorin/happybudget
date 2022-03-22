import classNames from "classnames";

import { RowExplicitCellProps } from "../cells/Cell";
import HeaderCell from "../cells/HeaderCell";
import Row, { RowProps } from "./Row";

interface HeaderRowProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue
> extends RowProps<R, M, V> {
  readonly cellProps?: RowExplicitCellProps<R, M, V>;
}

const HeaderRow = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  V extends Table.RawRowValue = Table.RawRowValue
>({
  cellProps,
  ...props
}: HeaderRowProps<R, M, V>): JSX.Element => (
  <Row<R, M, V>
    {...props}
    className={classNames("header-tr", props.className)}
    renderCell={(params: {
      lastChild: boolean;
      firstChild: boolean;
      column: Table.DataColumn<R, M, V>;
      colIndex: number;
    }) => {
      return <HeaderCell<R, M, V> {...params} {...cellProps} />;
    }}
  />
);

export default HeaderRow;

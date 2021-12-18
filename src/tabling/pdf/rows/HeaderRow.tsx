import classNames from "classnames";

import { RowExplicitCellProps } from "../cells/Cell";
import HeaderCell from "../cells/HeaderCell";
import Row, { RowProps } from "./Row";

interface HeaderRowProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
> extends RowProps<R, M, C> {
  readonly cellProps?: RowExplicitCellProps<R, M, C>;
}

const HeaderRow = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
>({
  cellProps,
  ...props
}: HeaderRowProps<R, M, C>): JSX.Element => {
  return (
    <Row<R, M, C>
      {...props}
      className={classNames("header-tr", props.className)}
      renderCell={(params: { lastChild: boolean; firstChild: boolean; column: C; colIndex: number }) => {
        return <HeaderCell<R, M> {...params} {...cellProps} />;
      }}
    />
  );
};

export default HeaderRow;

import classNames from "classnames";

import { RowExplicitCellProps } from "../Cells/Cell";
import HeaderCell from "../Cells/HeaderCell";
import Row, { RowProps } from "./Row";

interface HeaderRowProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> extends RowProps<R, M> {
  readonly cellProps?: RowExplicitCellProps<R, M>;
}

const HeaderRow = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>({
  cellProps,
  ...props
}: HeaderRowProps<R, M>): JSX.Element => {
  return (
    <Row<R, M>
      {...props}
      className={classNames("header-tr", props.className)}
      renderCell={(params: { column: Table.PdfColumn<R, M>; colIndex: number }) => {
        return <HeaderCell<R, M> colIndex={params.colIndex} column={params.column} {...cellProps} />;
      }}
    />
  );
};

export default HeaderRow;

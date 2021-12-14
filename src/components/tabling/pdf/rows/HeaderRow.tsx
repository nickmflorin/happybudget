import classNames from "classnames";

import { RowExplicitCellProps } from "../cells/Cell";
import HeaderCell from "../cells/HeaderCell";
import Row, { RowProps } from "./Row";

interface HeaderRowProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>
  extends RowProps<R, M> {
  readonly cellProps?: RowExplicitCellProps<R, M>;
}

const HeaderRow = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>({
  cellProps,
  ...props
}: HeaderRowProps<R, M>): JSX.Element => {
  return (
    <Row<R, M>
      {...props}
      className={classNames("header-tr", props.className)}
      renderCell={(params: {
        lastChild: boolean;
        firstChild: boolean;
        column: Table.PdfColumn<R, M>;
        colIndex: number;
      }) => {
        return <HeaderCell<R, M> {...params} {...cellProps} />;
      }}
    />
  );
};

export default HeaderRow;

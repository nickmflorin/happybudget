import { useMemo } from "react";
import { isNil, filter, reduce, map } from "lodash";

import { tabling, hooks } from "lib";
import Table from "./Table";
import { BodyRow, GroupRow, HeaderRow, FooterRow } from "../Rows";

type ColumnType = PdfTable.Column<Tables.PdfAccountRow, Model.PdfAccount>;
type ModelWithRowType = Table.ModelWithRow<Tables.PdfAccountRow, Model.PdfAccount>;
type RowGroupType = BudgetTable.RowGroup<Tables.PdfAccountRow, Model.PdfAccount>;

type AccountsTableProps = {
  readonly data: Model.PdfAccount[];
  readonly groups: Model.Group[];
  readonly columns: ColumnType[];
};

const AccountsTable = ({
  /* eslint-disable indent */
  columns,
  data,
  groups
}: AccountsTableProps): JSX.Element => {
  const showFooterRow = useMemo(() => {
    return filter(columns, (column: ColumnType) => !isNil(column.footer)).length !== 0;
  }, [columns]);

  const table: RowGroupType[] = tabling.util.createBudgetTableData<
    PdfTable.Column<Tables.PdfAccountRow, Model.PdfAccount>,
    Tables.PdfAccountRow,
    Model.PdfAccount
  >(columns, data, groups, {
    defaultNullValue: ""
  });

  const generateRows = hooks.useDynamicCallback((): JSX.Element[] => {
    let runningIndex = 1;
    const rows = reduce(
      table,
      (rws: JSX.Element[], rowGroup: RowGroupType) => {
        const newRows: JSX.Element[] = [
          ...rws,
          ...map(rowGroup.rows, (row: ModelWithRowType): JSX.Element => {
            const rowElement = <BodyRow key={runningIndex} index={runningIndex} columns={columns} row={row.row} />;
            runningIndex = runningIndex + 1;
            return rowElement;
          })
        ];
        if (!isNil(rowGroup.group)) {
          newRows.push(<GroupRow group={rowGroup.group} index={runningIndex} key={runningIndex} columns={columns} />);
          runningIndex = runningIndex + 1;
        }
        return newRows;
      },
      [<HeaderRow columns={columns} index={0} key={0} />]
    );
    if (showFooterRow === true) {
      rows.push(<FooterRow index={runningIndex} key={runningIndex} columns={columns} />);
    }
    return rows;
  });

  return <Table>{generateRows()}</Table>;
};

export default AccountsTable;

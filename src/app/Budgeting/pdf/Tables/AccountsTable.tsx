import { useMemo } from "react";
import { isNil, filter, reduce, map } from "lodash";

import { useDynamicCallback } from "lib/hooks";
import { createTableData } from "lib/model/util";
import Table from "./Table";
import { BodyRow, GroupRow, HeaderRow, FooterRow } from "../Rows";

type ColumnType = PdfTable.Column<PdfBudgetTable.AccountRow, Model.PdfAccount>;
type ModelWithRowType = GenericTable.ModelWithRow<PdfBudgetTable.AccountRow, Model.PdfAccount, PdfTable.RowMeta>;
type RowGroupType = GenericTable.RowGroup<PdfBudgetTable.AccountRow, Model.PdfAccount, PdfTable.RowMeta>;

const AccountsTable = ({
  /* eslint-disable indent */
  columns,
  data,
  groups
}: PdfBudgetTable.AccountsTableProps): JSX.Element => {
  const showFooterRow = useMemo(() => {
    return filter(columns, (column: ColumnType) => !isNil(column.footer)).length !== 0;
  }, [columns]);

  const table: RowGroupType[] = createTableData<
    PdfTable.Column<PdfBudgetTable.AccountRow, Model.PdfAccount>,
    PdfBudgetTable.AccountRow,
    Model.PdfAccount,
    PdfTable.RowMeta
  >(columns, data, groups, {
    defaultNullValue: ""
  });

  const generateRows = useDynamicCallback((): JSX.Element[] => {
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

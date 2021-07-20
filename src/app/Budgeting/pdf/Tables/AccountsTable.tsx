import { useMemo } from "react";
import { isNil, filter } from "lodash";

import { useDynamicCallback } from "lib/hooks";
import { createTableData } from "lib/model/util";
import Table from "./Table";
import { BodyRow, GroupRow, HeaderRow, FooterRow } from "../Rows";

type ColumnType = PdfTable.Column<PdfBudgetTable.AccountRow, Model.PdfAccount>;

const AccountsTable = ({
  /* eslint-disable indent */
  columns,
  data,
  groups
}: PdfBudgetTable.AccountsTableProps): JSX.Element => {
  const showFooterRow = useMemo(() => {
    return filter(columns, (column: ColumnType) => !isNil(column.footer)).length !== 0;
  }, [columns]);

  const table = createTableData<
    PdfTable.Column<PdfBudgetTable.AccountRow, Model.PdfAccount>,
    PdfBudgetTable.AccountRow,
    Model.PdfAccount,
    PdfTable.RowMeta
  >(columns, data, groups, {
    defaultNullValue: ""
  });

  const generateRows = useDynamicCallback((): JSX.Element[] => {
    let rows: JSX.Element[] = [<HeaderRow columns={columns} index={0} key={0} />];
    let runningIndex = 1;
    for (let i = 0; i < table.length; i++) {
      const group: GenericTable.RowGroup<PdfBudgetTable.AccountRow, PdfTable.RowMeta> = table[i];
      for (let j = 0; j < group.rows.length; j++) {
        const row: PdfBudgetTable.AccountRow = group.rows[j];
        rows.push(<BodyRow key={runningIndex} index={runningIndex} columns={columns} row={row} />);
        runningIndex = runningIndex + 1;
      }
      if (!isNil(group.group)) {
        rows.push(<GroupRow group={group.group} index={runningIndex} key={runningIndex} columns={columns} />);
        runningIndex = runningIndex + 1;
      }
    }
    if (showFooterRow === true) {
      rows.push(<FooterRow index={runningIndex} key={runningIndex} columns={columns} />);
    }
    return rows;
  });

  return <Table>{generateRows()}</Table>;
};

export default AccountsTable;

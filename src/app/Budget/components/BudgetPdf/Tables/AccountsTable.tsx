import { useMemo } from "react";
import { isNil, filter, reduce } from "lodash";

import { tabling, hooks } from "lib";
import Table from "./Table";
import { BodyRow, GroupRow, HeaderRow, FooterRow } from "../Rows";

type M = Model.PdfAccount;
type R = Tables.PdfAccountRowData;
type G = Model.BudgetGroup;

type AccountsTableProps = {
  readonly data: Model.PdfAccount[];
  readonly groups: Model.BudgetGroup[];
  readonly columns: PdfTable.Column<R, M, G>[];
};

const AccountsTable = ({
  /* eslint-disable indent */
  columns,
  data,
  groups
}: AccountsTableProps): JSX.Element => {
  const showFooterRow = useMemo(() => {
    return filter(columns, (column: PdfTable.Column<R, M, G>) => !isNil(column.footer)).length !== 0;
  }, [columns]);

  const table: Table.Row<R, M>[] = tabling.data.createTableRows<
    Tables.PdfAccountRowData,
    Model.PdfAccount,
    Model.BudgetGroup
  >({
    models: data,
    columns,
    groups,
    defaultNullValue: "",
    gridId: "data"
  });

  const generateRows = hooks.useDynamicCallback((): JSX.Element[] => {
    let runningIndex = 1;
    const rows = reduce(
      table,
      (rws: JSX.Element[], row: Table.Row<R, M>) => {
        runningIndex = runningIndex + 1;
        if (tabling.typeguards.isDataRow(row)) {
          return [...rws, <BodyRow key={runningIndex} index={runningIndex} columns={columns} row={row} />];
        }
        return [...rws, <GroupRow row={row} index={runningIndex} key={runningIndex} columns={columns} />];
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

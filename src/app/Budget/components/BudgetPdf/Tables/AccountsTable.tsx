import { useMemo } from "react";
import { isNil, filter, reduce } from "lodash";

import { tabling, hooks } from "lib";
import Table from "./Table";
import { BodyRow, GroupRow, HeaderRow, FooterRow } from "../Rows";

type M = Model.PdfAccount;
type R = Tables.PdfAccountRowData;

type AccountsTableProps = {
  readonly data: Model.PdfAccount[];
  readonly groups: Model.Group[];
  readonly columns: Table.PdfColumn<R, M>[];
};

const AccountsTable = ({
  /* eslint-disable indent */
  columns,
  data,
  groups
}: AccountsTableProps): JSX.Element => {
  const showFooterRow = useMemo(() => {
    return filter(columns, (column: Table.PdfColumn<R, M>) => !isNil(column.footer)).length !== 0;
  }, [columns]);

  const table: Table.Row<R>[] = tabling.data.createTableRows<Tables.PdfAccountRowData, Model.PdfAccount>({
    response: { models: data, groups },
    columns
  });

  const generateRows = hooks.useDynamicCallback((): JSX.Element[] => {
    let runningIndex = 1;
    const rows = reduce(
      table,
      (rws: JSX.Element[], row: Table.Row<R>) => {
        runningIndex = runningIndex + 1;
        if (tabling.typeguards.isDataRow(row)) {
          return [...rws, <BodyRow key={runningIndex} index={runningIndex} columns={columns} row={row} />];
        } else if (tabling.typeguards.isGroupRow(row)) {
          return [...rws, <GroupRow row={row} index={runningIndex} key={runningIndex} columns={columns} />];
        }
        return rws;
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

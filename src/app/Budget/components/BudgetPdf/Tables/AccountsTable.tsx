import React, { useMemo } from "react";
import { isNil, filter, reduce, find, map } from "lodash";

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

  const generateRows = hooks.useDynamicCallback((): JSX.Element[] => {
    const rows = reduce(
      tabling.data.createTableRows<Tables.PdfAccountRowData, Model.PdfAccount>({
        response: { models: data, groups },
        columns
      }),
      (rws: JSX.Element[], row: Table.BodyRow<R>) => {
        if (tabling.typeguards.isModelRow(row)) {
          return [...rws, <BodyRow columns={columns} row={row.data} />];
        } else if (tabling.typeguards.isGroupRow(row)) {
          const group = find(groups, { id: tabling.rows.groupId(row.id) });
          if (!isNil(group)) {
            return [...rws, <GroupRow group={group} row={row.data} columns={columns} />];
          }
          return rws;
        }
        return rws;
      },
      [<HeaderRow columns={columns} />]
    );
    if (showFooterRow === true) {
      rows.push(<FooterRow columns={columns} />);
    }
    return rows;
  });

  const rows = generateRows();
  return (
    <Table>
      {map(rows, (r: JSX.Element, index: number) => (
        <React.Fragment key={index}>{r}</React.Fragment>
      ))}
    </Table>
  );
};

export default AccountsTable;

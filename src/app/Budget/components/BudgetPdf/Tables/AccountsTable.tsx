import React from "react";
import { reduce, map } from "lodash";

import { tabling, hooks } from "lib";
import Table from "./Table";
import { BodyRow, GroupRow, HeaderRow, FooterRow } from "../Rows";

type M = Model.PdfAccount;
type R = Tables.PdfAccountRowData;

type AccountsTableProps = {
  readonly data: Model.PdfAccount[];
  readonly groups: Model.Group[];
  readonly markups: Model.Markup[];
  readonly columns: Table.PdfColumn<R, M>[];
};

const AccountsTable = ({
  /* eslint-disable indent */
  columns,
  markups,
  data,
  groups
}: AccountsTableProps): JSX.Element => {
  const generateRows = hooks.useDynamicCallback((): JSX.Element[] => {
    const rowData = tabling.data.createTableRows<Tables.PdfAccountRowData, Model.PdfAccount>({
      response: { models: data, groups, markups },
      columns
    });
    return [
      ...reduce(
        rowData,
        (rws: JSX.Element[], row: Table.BodyRow<R>) => {
          if (tabling.typeguards.isModelRow(row) || tabling.typeguards.isMarkupRow(row)) {
            return [...rws, <BodyRow columns={columns} row={row} data={rowData} />];
          } else if (tabling.typeguards.isGroupRow(row)) {
            return [...rws, <GroupRow row={row} columns={columns} data={rowData} />];
          }
          return rws;
        },
        [<HeaderRow columns={columns} />]
      ),
      <FooterRow columns={columns} data={rowData} />
    ];
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

import React, { useMemo } from "react";
import { includes, reduce, map } from "lodash";

import { tabling, hooks } from "lib";
import Table from "./Table";
import { BodyRow, GroupRow, HeaderRow, FooterRow } from "../Rows";

type M = Model.PdfAccount;
type R = Tables.AccountRowData;

type AccountsTableProps = {
  readonly data: Model.PdfAccount[];
  readonly groups: Model.Group[];
  readonly markups: Model.Markup[];
  readonly columns: Table.PdfColumn<R, M>[];
  readonly options: PdfBudgetTable.Options;
};

const AccountsTable = ({
  /* eslint-disable indent */
  columns,
  markups,
  data,
  groups,
  options
}: AccountsTableProps): JSX.Element => {
  const accountColumnIsVisible = useMemo(
    () => (c: Table.PdfColumn<Tables.AccountRowData, Model.PdfAccount>) =>
      includes(options.columns, tabling.columns.normalizedField<Tables.AccountRowData, Model.PdfAccount>(c)),
    [options.columns]
  );

  const generateRows = hooks.useDynamicCallback((): JSX.Element[] => {
    const rowData = tabling.data.createTableRows<R, M>({
      response: { models: data, groups, markups },
      columns
    });
    return [
      ...reduce(
        rowData,
        (rws: JSX.Element[], row: Table.BodyRow<R>) => {
          if (tabling.typeguards.isModelRow(row) || tabling.typeguards.isMarkupRow(row)) {
            return [
              ...rws,
              <BodyRow columnIsVisible={accountColumnIsVisible} columns={columns} row={row} data={rowData} />
            ];
          } else if (tabling.typeguards.isGroupRow(row)) {
            return [
              ...rws,
              <GroupRow row={row} columnIsVisible={accountColumnIsVisible} columns={columns} data={rowData} />
            ];
          }
          return rws;
        },
        [<HeaderRow columnIsVisible={accountColumnIsVisible} columns={columns} />]
      ),
      <FooterRow columnIsVisible={accountColumnIsVisible} columns={columns} data={rowData} />
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

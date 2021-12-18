import { useMemo } from "react";
import { includes, reduce } from "lodash";

import { tabling, hooks } from "lib";
import { BodyRow, GroupRow, HeaderRow, FooterRow } from "../rows";
import Table from "./Table";

type M = Model.PdfAccount;
type R = Tables.AccountRowData;
type C = Table.Column<R, M>;

type AccountsTableProps = {
  readonly data: M[];
  readonly groups: Model.Group[];
  readonly markups: Model.Markup[];
  readonly columns: C[];
  readonly options: PdfBudgetTable.Options;
};

const AccountsTable = ({ columns, markups, data, groups, options }: AccountsTableProps): JSX.Element => {
  const accountColumnIsVisible = useMemo(
    () => (c: C) => includes(options.columns, tabling.columns.normalizedField<R, M>(c)),
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
              <BodyRow<R, M, C> columnIsVisible={accountColumnIsVisible} columns={columns} row={row} data={rowData} />
            ];
          } else if (tabling.typeguards.isGroupRow(row)) {
            return [
              ...rws,
              <GroupRow<R, M, C> row={row} columnIsVisible={accountColumnIsVisible} columns={columns} data={rowData} />
            ];
          }
          return rws;
        },
        [<HeaderRow<R, M, C> columnIsVisible={accountColumnIsVisible} columns={columns} />]
      ),
      <FooterRow<R, M, C> columnIsVisible={accountColumnIsVisible} columns={columns} data={rowData} />
    ];
  });

  return <Table generateRows={generateRows} />;
};

export default AccountsTable;

import { useMemo } from "react";
import { includes, reduce, filter } from "lodash";

import { tabling, hooks } from "lib";
import { BodyRow, GroupRow, HeaderRow, FooterRow } from "../rows";
import Table from "./Table";

type M = Model.PdfAccount;
type R = Tables.AccountRowData;
type C = Table.ModelColumn<R, M>;
type DC = Table.DataColumn<R, M>;

type AccountsTableProps = {
  readonly data: M[];
  readonly groups: Model.Group[];
  readonly markups: Model.Markup[];
  readonly columns: C[];
  readonly options: PdfBudgetTable.Options;
};

const AccountsTable = ({ columns, markups, data, groups, options }: AccountsTableProps): JSX.Element => {
  const accountColumnIsVisible = useMemo(() => (c: DC) => includes(options.columns, c.field), [options.columns]);

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
              <BodyRow<R, M>
                key={`row-${row.id}`}
                columnIsVisible={accountColumnIsVisible}
                columns={filter(columns, (c: C) => tabling.typeguards.isDataColumn(c)) as DC[]}
                row={row}
                data={rowData}
              />
            ];
          } else if (tabling.typeguards.isGroupRow(row)) {
            return [
              ...rws,
              <GroupRow<R, M>
                key={`group-row-${row.id}`}
                row={row}
                columnIsVisible={accountColumnIsVisible}
                columns={filter(columns, (c: C) => tabling.typeguards.isDataColumn(c)) as DC[]}
                data={rowData}
              />
            ];
          }
          return rws;
        },
        [
          <HeaderRow<R, M>
            key={"header-row"}
            columnIsVisible={accountColumnIsVisible}
            columns={filter(columns, (c: C) => tabling.typeguards.isDataColumn(c)) as DC[]}
          />
        ]
      ),
      <FooterRow<R, M>
        key={"footer-row"}
        columnIsVisible={accountColumnIsVisible}
        columns={filter(columns, (c: C) => tabling.typeguards.isDataColumn(c)) as DC[]}
        data={rowData}
      />
    ];
  });

  return <Table generateRows={generateRows} />;
};

export default AccountsTable;

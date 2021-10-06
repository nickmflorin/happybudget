import React, { useMemo } from "react";
import { isNil, filter, reduce, find, map } from "lodash";
import classNames from "classnames";

import { tabling, hooks, model } from "lib";

import Table from "./Table";
import { BodyRow, HeaderRow, FooterRow, GroupRow } from "../Rows";

type M = Model.PdfSubAccount;
type R = Tables.PdfSubAccountRowData;

type AccountTableProps = {
  readonly account: Model.PdfAccount;
  readonly subAccountColumns: Table.PdfColumn<R, M>[];
  readonly columns: Table.PdfColumn<Tables.PdfAccountRowData, Model.PdfAccount>[];
  readonly options: PdfBudgetTable.Options;
};

const AccountTable = ({
  /* eslint-disable indent */
  columns,
  subAccountColumns,
  account,
  options
}: AccountTableProps): JSX.Element => {
  const showFooterRow = useMemo(() => {
    return filter(columns, (column: Table.Column<R, M>) => !isNil(column.footer)).length !== 0;
  }, [columns]);

  const accountSubHeaderRow: Tables.PdfAccountRow = useMemo(() => {
    return tabling.rows.createModelRow<
      Tables.PdfAccountRowData,
      Model.PdfAccount,
      Table.PdfColumn<Tables.PdfAccountRowData, Model.PdfAccount>
    >({
      model: account,
      columns
    });
  }, [account, columns]);

  const generateRows = hooks.useDynamicCallback((): JSX.Element[] => {
    const createSubAccountFooterRow = (subaccount: M): Table.ModelRow<R> => {
      return tabling.rows.createModelRow<R, M, Table.PdfColumn<R, M>>({
        model: subaccount,
        columns: subAccountColumns,
        getRowValue: (m: Model.PdfSubAccount, c: Table.PdfColumn<R, M>) => {
          if (!isNil(c.childFooter) && !isNil(c.childFooter(subaccount).value)) {
            return c.childFooter(subaccount).value;
          }
        }
      });
    };

    const createSubAccountHeaderRow = (subaccount: M): Table.ModelRow<R> => {
      return tabling.rows.createModelRow<R, M, Table.PdfColumn<R, M>>({
        model: subaccount,
        columns: subAccountColumns,
        excludeColumns: (c: Table.PdfColumn<R, M>) =>
          !isNil(subaccount[c.field as keyof M]) &&
          (subaccount.children.length === 0 || c.tableColumnType !== "calculated"),
        getRowValue: (m: Model.PdfSubAccount, c: Table.PdfColumn<R, M>) => {
          if (!isNil(c.childFooter) && !isNil(c.childFooter(subaccount).value)) {
            return c.childFooter(subaccount).value;
          }
        }
      });
    };

    const subaccounts = filter(
      account.children,
      (subaccount: M) => !(options.excludeZeroTotals === true) || model.businessLogic.estimatedValue(subaccount) !== 0
    );
    const table: Table.BodyRow<R>[] = tabling.data.createTableRows<R, M>({
      response: { models: subaccounts, groups: account.groups },
      columns: subAccountColumns
    });

    let rows = reduce(
      filter(table, (r: Table.BodyRow<R>) => tabling.typeguards.isModelRow(r) || tabling.typeguards.isGroupRow(r)) as (
        | Table.ModelRow<R>
        | Table.GroupRow<R>
      )[],
      (rws: JSX.Element[], subAccountRow: Table.ModelRow<R> | Table.GroupRow<R>) => {
        if (tabling.typeguards.isModelRow(subAccountRow)) {
          const subAccount: Model.PdfSubAccount | undefined = find(subaccounts, { id: subAccountRow.id });
          if (!isNil(subAccount)) {
            const details = subAccount.children;
            const showSubAccountFooterRow =
              filter(columns, (column: Table.PdfColumn<R, M>) => !isNil(column.childFooter)).length !== 0 &&
              details.length !== 0;
            // const isLastSubAccount = subaccountRowGroupIndex === subaccounts.length - 1;
            const isLastSubAccount = false;

            const subTable: Table.BodyRow<R>[] = tabling.data.createTableRows<R, M>({
              response: { models: details, groups: subAccount.groups },
              columns: subAccountColumns
            });

            let subRows: JSX.Element[] = reduce(
              filter(
                subTable,
                (r: Table.BodyRow<R>) => tabling.typeguards.isModelRow(r) || tabling.typeguards.isGroupRow(r)
              ) as (Table.ModelRow<R> | Table.GroupRow<R>)[],
              (subRws: JSX.Element[], detailRow: Table.ModelRow<R> | Table.GroupRow<R>) => {
                if (tabling.typeguards.isModelRow(detailRow)) {
                  return [
                    ...subRws,
                    <BodyRow<R, M>
                      columns={subAccountColumns}
                      className={"detail-tr"}
                      row={detailRow}
                      data={table}
                      cellProps={{
                        cellContentsVisible: (params: Table.PdfCellCallbackParams<R, M>) =>
                          params.column.field === "identifier" ? false : true,
                        textClassName: "detail-tr-td-text",
                        className: (params: Table.PdfCellCallbackParams<R, M>) => {
                          if (params.column.field === "description") {
                            return classNames("detail-td", "indent-td");
                          }
                          return "detail-td";
                        }
                      }}
                    />
                  ];
                } else {
                  return [
                    ...rws,
                    <GroupRow
                      className={"detail-group-tr"}
                      row={detailRow}
                      data={table}
                      columns={subAccountColumns}
                      columnIndent={1}
                      cellProps={{
                        textClassName: (params: Table.PdfCellCallbackParams<R, M>) => {
                          if (params.column.field === "description") {
                            return "detail-group-indent-td";
                          }
                          return "";
                        }
                      }}
                    />
                  ];
                }
              },
              [
                <BodyRow
                  cellProps={{ className: "subaccount-td", textClassName: "subaccount-tr-td-text" }}
                  className={"subaccount-tr"}
                  columns={subAccountColumns}
                  data={table}
                  row={createSubAccountHeaderRow(subAccount)}
                />
              ]
            );
            if (showSubAccountFooterRow === true) {
              const footerRow = createSubAccountFooterRow(subAccount);
              subRows = [
                ...subRows,
                <BodyRow
                  className={"subaccount-footer-tr"}
                  cellProps={{ className: "subaccount-footer-td", textClassName: "subaccount-footer-tr-td-text" }}
                  columns={subAccountColumns}
                  data={table}
                  row={footerRow}
                  style={!isLastSubAccount ? { borderBottomWidth: 1 } : {}}
                />
              ];
            }
            return [...rws, ...subRows];
          }
          return rws;
        } else {
          return [...rws, <GroupRow row={subAccountRow} columns={subAccountColumns} data={table} />];
        }
      },
      [
        <HeaderRow className={"account-header-tr"} columns={subAccountColumns} />,
        <BodyRow<Tables.PdfAccountRowData, Model.PdfAccount>
          className={"account-sub-header-tr"}
          cellProps={{ textClassName: "account-sub-header-tr-td-text" }}
          columns={columns}
          data={table}
          row={accountSubHeaderRow}
        />
      ]
    );
    if (showFooterRow === true) {
      rows = [...rows, <FooterRow columns={subAccountColumns} data={table} />];
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

export default AccountTable;

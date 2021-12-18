import React, { useMemo } from "react";
import { isNil, filter, reduce, find, includes } from "lodash";
import classNames from "classnames";

import { tabling, hooks, budgeting } from "lib";

import { BodyRow, HeaderRow, FooterRow, GroupRow } from "../rows";
import Table from "./Table";

type M = Model.PdfSubAccount;
type R = Tables.SubAccountRowData;
type C = Table.Column<R, M>;

type AM = Model.PdfAccount;
type AR = Tables.AccountRowData;
type AC = Table.Column<AR, AM>;

type AccountTableProps = {
  readonly account: Model.PdfAccount;
  readonly subAccountColumns: C[];
  readonly columns: AC[];
  readonly options: PdfBudgetTable.Options;
};

const AccountTable = ({ columns, subAccountColumns, account, options }: AccountTableProps): JSX.Element => {
  const accountSubAccountColumns = useMemo(() => {
    return reduce(
      subAccountColumns,
      (curr: AC[], c: C) => {
        return [
          ...curr,
          {
            field: c.field,
            colId: c.colId,
            tableColumnType: c.tableColumnType,
            columnType: c.columnType,
            pdfWidth: c.pdfWidth,
            pdfCellProps: c.pdfCellProps,
            pdfHeaderCellProps: c.pdfHeaderCellProps,
            pdfFooter: c.pdfFooter,
            pdfCellContentsVisible: c.pdfCellContentsVisible,
            pdfFooterValueGetter: c.pdfFooterValueGetter,
            pdfFormatter: c.pdfFormatter,
            pdfValueGetter: c.pdfValueGetter,
            pdfCellRenderer: c.pdfCellRenderer,
            pdfChildFooter: c.pdfChildFooter
          } as AC
        ];
      },
      []
    );
  }, [columns, subAccountColumns]);

  const accountSubHeaderRow: Tables.AccountRow = useMemo(() => {
    const accountRowManager = new tabling.managers.ModelRowManager<AR, AM>({
      columns
    });
    return accountRowManager.create({
      model: account
    });
  }, [account, columns]);

  const accountColumnIsVisible = useMemo(
    () => (c: AC) => includes(options.columns, tabling.columns.normalizedField<AR, AM>(c)),
    [options.columns]
  );

  const subAccountColumnIsVisible = useMemo(
    () => (c: C) => includes(options.columns, tabling.columns.normalizedField<R, M>(c)),
    [options.columns]
  );

  const generateRows = hooks.useDynamicCallback((): JSX.Element[] => {
    const subAccountRowManager = new tabling.managers.ModelRowManager<R, M>({
      columns: subAccountColumns
    });
    const createSubAccountFooterRow = (subaccount: M): Table.ModelRow<R> => {
      return subAccountRowManager.create({
        model: subaccount,
        getRowValue: (m: Model.PdfSubAccount, c: C) => {
          if (!isNil(c.pdfChildFooter) && !isNil(c.pdfChildFooter(m).value)) {
            return c.pdfChildFooter(m).value;
          }
        }
      });
    };

    const subaccounts = filter(
      account.children,
      (subaccount: M) =>
        !(options.excludeZeroTotals === true) || budgeting.businessLogic.estimatedValue(subaccount) !== 0
    );
    const table: Table.BodyRow<R>[] = tabling.data.createTableRows<R, M>({
      response: { models: subaccounts, groups: account.groups, markups: account.children_markups },
      columns: subAccountColumns
    });

    return [
      ...reduce(
        filter(
          table,
          (r: Table.BodyRow<R>) =>
            tabling.typeguards.isModelRow(r) || tabling.typeguards.isGroupRow(r) || tabling.typeguards.isMarkupRow(r)
        ) as (Table.ModelRow<R> | Table.GroupRow<R> | Table.MarkupRow<R>)[],
        (rws: JSX.Element[], subAccountRow: Table.ModelRow<R> | Table.GroupRow<R> | Table.MarkupRow<R>) => {
          if (tabling.typeguards.isModelRow(subAccountRow)) {
            const subAccount: Model.PdfSubAccount | undefined = find(subaccounts, { id: subAccountRow.id });
            if (!isNil(subAccount)) {
              const details = subAccount.children;
              const markups = subAccount.children_markups;
              /*
              Note: If there are no details, then there are no markups that are
							assigned to a given detail.  And if a Markup is not assigned any
							children, it will be automatically deleted by the backend.
							However, we still include in the conditional check here for
              completeness sake.
              */
              if (details.length === 0 && markups.length === 0) {
                return [
                  ...rws,
                  <BodyRow<R, M, C>
                    cellProps={{ className: "subaccount-td", textClassName: "subaccount-tr-td-text" }}
                    className={"subaccount-tr"}
                    columns={subAccountColumns}
                    columnIsVisible={subAccountColumnIsVisible}
                    data={table}
                    row={subAccountRow}
                  />
                ];
              } else {
                const subTable: Table.BodyRow<R>[] = tabling.data.createTableRows<R, M>({
                  response: { models: details, groups: subAccount.groups, markups },
                  columns: subAccountColumns
                });
                let subRows: JSX.Element[] = reduce(
                  filter(
                    subTable,
                    (r: Table.BodyRow<R>) =>
                      tabling.typeguards.isModelRow(r) ||
                      tabling.typeguards.isGroupRow(r) ||
                      tabling.typeguards.isMarkupRow(r)
                  ) as (Table.ModelRow<R> | Table.GroupRow<R>)[],
                  (subRws: JSX.Element[], detailRow: Table.ModelRow<R> | Table.GroupRow<R> | Table.MarkupRow<R>) => {
                    if (tabling.typeguards.isModelRow(detailRow) || tabling.typeguards.isMarkupRow(detailRow)) {
                      return [
                        ...subRws,
                        <BodyRow<R, M>
                          columns={subAccountColumns}
                          columnIsVisible={subAccountColumnIsVisible}
                          className={"detail-tr"}
                          row={detailRow}
                          data={table}
                          cellProps={{
                            textClassName: "detail-tr-td-text",
                            className: (params: Table.PdfCellCallbackParams<R, M, Table.InferColumnValue<C>>) => {
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
                        ...subRws,
                        <GroupRow
                          className={"detail-group-tr"}
                          row={detailRow}
                          data={table}
                          columns={subAccountColumns}
                          columnIsVisible={subAccountColumnIsVisible}
                          columnIndent={1}
                          cellProps={{
                            textClassName: (params: Table.PdfCellCallbackParams<R, M, Table.InferColumnValue<C>>) => {
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
                      cellProps={{
                        className: "subaccount-td",
                        textClassName: "subaccount-tr-td-text",
                        cellContentsInvisible: (params: Table.PdfCellCallbackParams<R, M>) =>
                          !includes(["description", "identifier"], tabling.columns.normalizedField<R, M>(params.column))
                      }}
                      className={"subaccount-tr"}
                      columns={subAccountColumns}
                      data={table}
                      row={subAccountRow}
                      columnIsVisible={subAccountColumnIsVisible}
                    />
                  ]
                );
                const footerRow = createSubAccountFooterRow(subAccount);
                subRows = [
                  ...subRows,
                  <BodyRow<R, M, C>
                    className={"subaccount-footer-tr"}
                    cellProps={{ className: "subaccount-footer-td", textClassName: "subaccount-footer-tr-td-text" }}
                    columns={subAccountColumns}
                    columnIsVisible={subAccountColumnIsVisible}
                    data={table}
                    row={footerRow}
                    style={{ borderBottomWidth: 1 }}
                  />
                ];
                return [...rws, ...subRows];
              }
            }
            return rws;
          } else if (tabling.typeguards.isMarkupRow(subAccountRow)) {
            return [
              ...rws,
              <BodyRow<R, M, C>
                cellProps={{ className: "subaccount-td", textClassName: "subaccount-tr-td-text" }}
                className={"subaccount-tr"}
                columns={subAccountColumns}
                columnIsVisible={subAccountColumnIsVisible}
                data={table}
                row={subAccountRow}
              />
            ];
          } else {
            return [
              ...rws,
              <GroupRow<R, M, C>
                row={subAccountRow}
                columnIsVisible={subAccountColumnIsVisible}
                columns={subAccountColumns}
                data={table}
              />
            ];
          }
        },
        [
          <HeaderRow<R, M, C>
            className={"account-header-tr"}
            columns={subAccountColumns}
            columnIsVisible={subAccountColumnIsVisible}
          />,
          <BodyRow<AR, AM, AC>
            className={"account-sub-header-tr"}
            cellProps={{ textClassName: "account-sub-header-tr-td-text" }}
            columns={accountSubAccountColumns}
            columnIsVisible={accountColumnIsVisible}
            data={table}
            row={accountSubHeaderRow}
          />
        ]
      ),
      <FooterRow<R, M, C> columns={subAccountColumns} columnIsVisible={subAccountColumnIsVisible} data={table} />
    ];
  });

  return <Table generateRows={generateRows} />;
};

export default AccountTable;

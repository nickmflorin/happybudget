import React, { useMemo } from "react";
import { isNil, filter, reduce, find, map, includes } from "lodash";
import classNames from "classnames";

import { tabling, hooks, model } from "lib";

import Table from "./Table";
import { BodyRow, HeaderRow, FooterRow, GroupRow } from "../Rows";

type M = Model.PdfSubAccount;
type R = Tables.SubAccountRowData;

type AccountTableProps = {
  readonly account: Model.PdfAccount;
  readonly subAccountColumns: Table.PdfColumn<R, M>[];
  readonly columns: Table.PdfColumn<Tables.AccountRowData, Model.PdfAccount>[];
  readonly options: PdfBudgetTable.Options;
};

const AccountTable = ({
  /* eslint-disable indent */
  columns,
  subAccountColumns,
  account,
  options
}: AccountTableProps): JSX.Element => {
  const accountSubAccountColumns = useMemo(() => {
    return reduce(
      subAccountColumns,
      (curr: Table.PdfColumn<Tables.AccountRowData, Model.PdfAccount>[], c: Table.PdfColumn<R, M>) => {
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
          } as Table.PdfColumn<Tables.AccountRowData, Model.PdfAccount>
        ];
      },
      []
    );
  }, [columns, subAccountColumns]);

  const accountSubHeaderRow: Tables.AccountRow = useMemo(() => {
    const accountRowManager = new tabling.managers.ModelRowManager<Tables.AccountRowData, Model.PdfAccount>({
      columns
    });
    return accountRowManager.create({
      model: account,
      originalIndex: 0 // Irrelevant for PDF rows since they are not dynamic.
    });
  }, [account, columns]);

  const generateRows = hooks.useDynamicCallback((): JSX.Element[] => {
    const subAccountRowManager = new tabling.managers.ModelRowManager<Tables.SubAccountRowData, Model.PdfSubAccount>({
      columns: subAccountColumns
    });
    const createSubAccountFooterRow = (subaccount: M): Table.ModelRow<R> => {
      return subAccountRowManager.create({
        model: subaccount,
        originalIndex: 0, // Irrelevant for PDF rows since they are not dynamic.
        getRowValue: (m: Model.PdfSubAccount, c: Table.PdfColumn<R, M>) => {
          if (!isNil(c.pdfChildFooter) && !isNil(c.pdfChildFooter(m).value)) {
            return c.pdfChildFooter(m).value;
          }
        }
      });
    };

    const subaccounts = filter(
      account.children,
      (subaccount: M) => !(options.excludeZeroTotals === true) || model.businessLogic.estimatedValue(subaccount) !== 0
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
              Note: If there are no details, then there are no markups that are assigned to
              a given detail.  And if a Markup is not assigned any children, it will be automatically
              deleted by the backend.  However, we still include in the conditional check here for
              completeness sake.
              */
              if (details.length === 0 && markups.length === 0) {
                return [
                  ...rws,
                  <BodyRow
                    cellProps={{ className: "subaccount-td", textClassName: "subaccount-tr-td-text" }}
                    className={"subaccount-tr"}
                    columns={subAccountColumns}
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
                          className={"detail-tr"}
                          row={detailRow}
                          data={table}
                          cellProps={{
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
                      cellProps={{
                        className: "subaccount-td",
                        textClassName: "subaccount-tr-td-text",
                        cellContentsInvisible: (params: Table.PdfCellCallbackParams<R, M>) =>
                          !includes(["description", "identifier"], tabling.columns.normalizedField(params.column))
                      }}
                      className={"subaccount-tr"}
                      columns={subAccountColumns}
                      data={table}
                      row={subAccountRow}
                    />
                  ]
                );
                const footerRow = createSubAccountFooterRow(subAccount);
                subRows = [
                  ...subRows,
                  <BodyRow
                    className={"subaccount-footer-tr"}
                    cellProps={{ className: "subaccount-footer-td", textClassName: "subaccount-footer-tr-td-text" }}
                    columns={subAccountColumns}
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
              <BodyRow
                cellProps={{ className: "subaccount-td", textClassName: "subaccount-tr-td-text" }}
                className={"subaccount-tr"}
                columns={subAccountColumns}
                data={table}
                row={subAccountRow}
              />
            ];
          } else {
            return [...rws, <GroupRow row={subAccountRow} columns={subAccountColumns} data={table} />];
          }
        },
        [
          <HeaderRow className={"account-header-tr"} columns={subAccountColumns} />,
          <BodyRow<Tables.AccountRowData, Model.PdfAccount>
            className={"account-sub-header-tr"}
            cellProps={{ textClassName: "account-sub-header-tr-td-text" }}
            columns={accountSubAccountColumns}
            data={table}
            row={accountSubHeaderRow}
          />
        ]
      ),
      <FooterRow columns={subAccountColumns} data={table} />
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

export default AccountTable;

import { useMemo } from "react";
import { isNil, filter, forEach, reduce, map, flatten } from "lodash";
import classNames from "classnames";

import { useDynamicCallback } from "lib/hooks";
import { createTableData } from "lib/model/util";

import Table from "./Table";
import { BodyRow, HeaderRow, FooterRow, GroupRow } from "../Rows";

type ColumnType = PdfTable.Column<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>;
type ModelWithRowType = GenericTable.ModelWithRow<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount, PdfTable.RowMeta>;
type RowGroupType = GenericTable.RowGroup<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount, PdfTable.RowMeta>;

const AccountTable = ({
  /* eslint-disable indent */
  columns,
  account,
  options
}: PdfBudgetTable.AccountTableProps): JSX.Element => {
  const showFooterRow = useMemo(() => {
    return filter(columns, (column: ColumnType) => !isNil(column.footer)).length !== 0;
  }, [columns]);

  const accountSubHeaderRow = useMemo(() => {
    const row: { [key: string]: any } = {};
    forEach(columns, (column: ColumnType) => {
      if (!isNil(account[column.field as keyof Model.PdfAccount]) && column.isCalculated !== true) {
        row[column.field as keyof Model.PdfAccount] = account[column.field as keyof Model.PdfAccount];
      } else {
        row[column.field as keyof Model.PdfAccount] = null;
      }
    });
    return row as PdfBudgetTable.SubAccountRow;
  }, [account, columns]);

  const generateRows = useDynamicCallback((): JSX.Element[] => {
    const createSubAccountFooterRow = (subaccount: Model.PdfSubAccount) => {
      return reduce(
        columns,
        (obj: { [key: string]: any }, col: ColumnType) => {
          if (!isNil(col.childFooter) && !isNil(col.childFooter(subaccount).value)) {
            obj[col.field as string] = col.childFooter(subaccount).value;
          } else {
            obj[col.field as string] = null;
          }
          return obj;
        },
        {}
      ) as PdfBudgetTable.SubAccountRow;
    };

    const createSubAccountHeaderRow = (subaccount: Model.PdfSubAccount) => {
      return reduce(
        columns,
        (obj: { [key: string]: any }, col: ColumnType) => {
          if (
            !isNil(subaccount[col.field as keyof Model.PdfSubAccount]) &&
            (subaccount.subaccounts.length === 0 || col.isCalculated !== true)
          ) {
            obj[col.field as string] = subaccount[col.field as keyof Model.PdfSubAccount];
          } else {
            obj[col.field as string] = null;
          }
          return obj;
        },
        {}
      ) as PdfBudgetTable.SubAccountRow;
    };

    const subaccounts = filter(
      account.subaccounts,
      (subaccount: Model.PdfSubAccount) => !(options.excludeZeroTotals === true) || subaccount.estimated !== 0
    );
    const table = createTableData<
      PdfTable.Column<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>,
      PdfBudgetTable.SubAccountRow,
      Model.PdfSubAccount,
      PdfTable.RowMeta
    >(columns, subaccounts, account.groups, {
      defaultNullValue: ""
    });

    let runningIndex = 2;
    let rows = reduce(
      table,
      (rws: JSX.Element[], subaccountRowGroup: RowGroupType) => {
        const newRows: JSX.Element[] = [
          ...rws,
          ...flatten(
            map(
              subaccountRowGroup.rows,
              (subaccountRow: ModelWithRowType, subaccountRowGroupIndex: number): JSX.Element[] => {
                const details = subaccountRow.model.subaccounts;
                const showSubAccountFooterRow =
                  filter(columns, (column: ColumnType) => !isNil(column.childFooter)).length !== 0 &&
                  details.length !== 0;
                const isLastSubAccount = subaccountRowGroupIndex === subaccounts.length - 1;

                const subTable = createTableData<
                  PdfTable.Column<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>,
                  PdfBudgetTable.SubAccountRow,
                  Model.PdfSubAccount,
                  PdfTable.RowMeta
                >(columns, details, subaccountRow.model.groups, {
                  defaultNullValue: ""
                });
                runningIndex = runningIndex + 1;
                let subRows: JSX.Element[] = reduce(
                  subTable,
                  (subRws: JSX.Element[], detailRowGroup: RowGroupType) => {
                    const newSubTableRows = [
                      ...subRws,
                      ...map(detailRowGroup.rows, (detailRow: ModelWithRowType): JSX.Element => {
                        runningIndex = runningIndex + 1;
                        const element = (
                          <BodyRow<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>
                            key={runningIndex}
                            index={runningIndex}
                            columns={columns}
                            className={"detail-tr"}
                            row={detailRow.row}
                            cellProps={{
                              cellContentsVisible: (
                                params: PdfTable.CellCallbackParams<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>
                              ) => (params.column.field === "identifier" ? false : true),
                              textClassName: "detail-tr-td-text",
                              className: (
                                params: PdfTable.CellCallbackParams<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>
                              ) => {
                                if (params.column.field === "description") {
                                  return classNames("detail-td", "indent-td");
                                }
                                return "detail-td";
                              }
                            }}
                          />
                        );
                        return element;
                      })
                    ];
                    if (!isNil(detailRowGroup.group)) {
                      runningIndex = runningIndex + 1;
                      newSubTableRows.push(
                        <GroupRow
                          className={"detail-group-tr"}
                          group={detailRowGroup.group}
                          index={runningIndex}
                          key={runningIndex}
                          columns={columns}
                          columnIndent={1}
                          cellProps={{
                            textClassName: (
                              params: PdfTable.CellCallbackParams<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>
                            ) => {
                              if (params.column.field === "description") {
                                return "detail-group-indent-td";
                              }
                              return "";
                            }
                          }}
                        />
                      );
                    }
                    return newSubTableRows;
                  },
                  [
                    <BodyRow
                      key={runningIndex}
                      index={runningIndex}
                      cellProps={{ className: "subaccount-td", textClassName: "subaccount-tr-td-text" }}
                      className={"subaccount-tr"}
                      columns={columns}
                      row={createSubAccountHeaderRow(subaccountRow.model)}
                    />
                  ]
                );

                if (showSubAccountFooterRow === true) {
                  const footerRow: PdfBudgetTable.SubAccountRow = createSubAccountFooterRow(subaccountRow.model);
                  runningIndex = runningIndex + 1;
                  subRows = [
                    ...subRows,
                    <BodyRow
                      key={runningIndex}
                      index={runningIndex}
                      className={"subaccount-footer-tr"}
                      cellProps={{ className: "subaccount-footer-td", textClassName: "subaccount-footer-tr-td-text" }}
                      columns={columns}
                      row={footerRow}
                      style={!isLastSubAccount ? { borderBottomWidth: 1 } : {}}
                    />
                  ];
                }
                return subRows;
              }
            )
          )
        ];
        if (!isNil(subaccountRowGroup.group)) {
          runningIndex = runningIndex + 1;
          newRows.push(
            <GroupRow group={subaccountRowGroup.group} index={runningIndex} key={runningIndex} columns={columns} />
          );
        }
        return newRows;
      },
      [
        <HeaderRow className={"account-header-tr"} columns={columns} index={0} key={0} />,
        <BodyRow<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>
          key={1}
          index={1}
          className={"account-sub-header-tr"}
          cellProps={{ textClassName: "account-sub-header-tr-td-text" }}
          columns={columns}
          row={accountSubHeaderRow}
        />
      ]
    );
    if (showFooterRow === true) {
      runningIndex = runningIndex + 1;
      rows = [...rows, <FooterRow index={runningIndex} key={runningIndex} columns={columns} />];
    }
    return rows;
  });

  return <Table>{generateRows()}</Table>;
};

export default AccountTable;

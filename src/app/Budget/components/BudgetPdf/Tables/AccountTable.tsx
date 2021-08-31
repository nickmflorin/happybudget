import { useMemo } from "react";
import { isNil, filter, forEach, reduce, map, flatten } from "lodash";
import classNames from "classnames";

import { tabling, hooks } from "lib";

import Table from "./Table";
import { BodyRow, HeaderRow, FooterRow, GroupRow } from "../Rows";

type M = Model.PdfSubAccount;
type R = Tables.PdfSubAccountRowData;

type AccountTableProps = {
  readonly account: Model.PdfAccount;
  readonly columns: PdfTable.Column<R, M>[];
  readonly options: PdfBudgetTable.Options;
};

const AccountTable = ({
  /* eslint-disable indent */
  columns,
  account,
  options
}: AccountTableProps): JSX.Element => {
  const showFooterRow = useMemo(() => {
    return filter(columns, (column: Table.Column<R, M>) => !isNil(column.footer)).length !== 0;
  }, [columns]);

  const accountSubHeaderRow = useMemo(() => {
    const row: { [key: string]: any } = {};
    forEach(columns, (column: PdfTable.Column<R, M>) => {
      if (!isNil(account[column.field as keyof Model.PdfAccount])) {
        row[column.field as keyof Model.PdfAccount] = account[column.field as keyof Model.PdfAccount];
      } else {
        row[column.field as keyof Model.PdfAccount] = null;
      }
    });
    return row as Table.ModelRow<R, M>;
  }, [account, columns]);

  const generateRows = hooks.useDynamicCallback((): JSX.Element[] => {
    const createSubAccountFooterRow = (subaccount: M) => {
      return reduce(
        columns,
        (obj: { [key: string]: any }, col: PdfTable.Column<R, M>) => {
          if (!isNil(col.childFooter) && !isNil(col.childFooter(subaccount).value)) {
            obj[col.field as string] = col.childFooter(subaccount).value;
          } else {
            obj[col.field as string] = null;
          }
          return obj;
        },
        {}
      ) as Table.ModelRow<R, M>;
    };

    const createSubAccountHeaderRow = (subaccount: M) => {
      return reduce(
        columns,
        (obj: { [key: string]: any }, col: PdfTable.Column<R, M>) => {
          if (
            !isNil(subaccount[col.field as keyof M]) &&
            (subaccount.subaccounts.length === 0 || col.tableColumnType !== "calculated")
          ) {
            obj[col.field as string] = subaccount[col.field as keyof M];
          } else {
            obj[col.field as string] = null;
          }
          return obj;
        },
        {}
      ) as Table.ModelRow<R, M>;
    };

    const subaccounts = filter(
      account.subaccounts,
      (subaccount: M) => !(options.excludeZeroTotals === true) || subaccount.estimated !== 0
    );
    const table = tabling.data.createTableData<R, M, Model.BudgetGroup>({
      models: subaccounts,
      columns,
      groups: account.groups,
      defaultNullValue: ""
    });

    let runningIndex = 2;
    let rows = reduce(
      table,
      (rws: JSX.Element[], subaccountRowGroup: Table.RowGroup<R, M, Model.BudgetGroup>) => {
        const newRows: JSX.Element[] = [
          ...rws,
          ...flatten(
            map(
              subaccountRowGroup.rows,
              (subaccountRow: Table.ModelWithRow<R, M>, subaccountRowGroupIndex: number): JSX.Element[] => {
                const details = subaccountRow.model.subaccounts;
                const showSubAccountFooterRow =
                  filter(columns, (column: PdfTable.Column<R, M>) => !isNil(column.childFooter)).length !== 0 &&
                  details.length !== 0;
                const isLastSubAccount = subaccountRowGroupIndex === subaccounts.length - 1;

                const subTable = tabling.data.createTableData<R, M, Model.BudgetGroup>({
                  models: details,
                  columns,
                  groups: subaccountRow.model.groups,
                  defaultNullValue: ""
                });
                runningIndex = runningIndex + 1;
                let subRows: JSX.Element[] = reduce(
                  subTable,
                  (subRws: JSX.Element[], detailRowGroup: Table.RowGroup<R, M, Model.BudgetGroup>) => {
                    const newSubTableRows = [
                      ...subRws,
                      ...map(detailRowGroup.rows, (detailRow: Table.ModelWithRow<R, M>): JSX.Element => {
                        runningIndex = runningIndex + 1;
                        const element = (
                          <BodyRow<R, M>
                            key={runningIndex}
                            index={runningIndex}
                            columns={columns}
                            className={"detail-tr"}
                            row={detailRow.row}
                            cellProps={{
                              cellContentsVisible: (params: PdfTable.CellCallbackParams<R, M>) =>
                                params.column.field === "identifier" ? false : true,
                              textClassName: "detail-tr-td-text",
                              className: (params: PdfTable.CellCallbackParams<R, M>) => {
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
                            textClassName: (params: PdfTable.CellCallbackParams<R, M>) => {
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
                  const footerRow: Table.ModelRow<R, M> = createSubAccountFooterRow(subaccountRow.model);
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
        <BodyRow<R, M>
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

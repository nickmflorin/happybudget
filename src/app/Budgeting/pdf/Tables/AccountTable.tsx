import { useMemo } from "react";
import { isNil, filter, forEach, reduce } from "lodash";
import classNames from "classnames";

import { useDynamicCallback } from "lib/hooks";

import Table from "./Table";
import { BodyRow, HeaderRow, FooterRow } from "../Rows";

type ColumnType = Table.PdfColumn<BudgetPdf.SubAccountRow, Model.PdfSubAccount>;

const AccountTable = ({
  /* eslint-disable indent */
  columns,
  account,
  manager,
  options
}: BudgetPdf.AccountTableProps): JSX.Element => {
  const showFooterRow = useMemo(() => {
    return filter(columns, (column: ColumnType) => !isNil(column.footer)).length !== 0;
  }, [columns]);

  const accountSubHeaderRow = useMemo(() => {
    const row: { [key: string]: any } = {};
    forEach(columns, (column: ColumnType) => {
      if (!isNil(account[column.field as keyof Model.PdfAccount]) && column.isCalculated !== true) {
        row[column.field] = account[column.field as keyof Model.PdfAccount];
      } else {
        row[column.field] = null;
      }
    });
    return row as BudgetPdf.SubAccountRow;
  }, [account, columns]);

  const generateRows = useDynamicCallback((): JSX.Element[] => {
    let rows: JSX.Element[] = [
      <HeaderRow className={"account-header-tr"} columns={columns} index={0} key={0} />,
      <BodyRow<BudgetPdf.SubAccountRow, Model.PdfSubAccount>
        key={1}
        index={1}
        className={"account-sub-header-tr"}
        cellProps={{ textClassName: "account-sub-header-tr-td-text" }}
        columns={columns}
        row={accountSubHeaderRow}
      />
    ];
    let runningIndex = 2;

    const subaccounts = filter(
      account.subaccounts,
      (subaccount: Model.PdfSubAccount) => !(options.excludeZeroTotals === true) || subaccount.estimated !== 0
    );
    forEach(subaccounts, (subaccount: Model.PdfSubAccount, i: number) => {
      const details = filter(
        subaccount.subaccounts,
        (detail: Model.PdfSubAccount) => !(options.excludeZeroTotals === true) || detail.estimated !== 0
      );
      const showSubAccountFooterRow =
        filter(columns, (column: ColumnType) => !isNil(column.childFooter)).length !== 0 && details.length !== 0;
      const isLastSubAccount = i === subaccounts.length - 1;

      // NOTE: While we should be using manager.modelToRow() to stay consistent,
      // we want to exclude calculated fields here - which the manager does not
      // do.  We need to deprecate the manager.modelToRow() method.
      /* eslint-disable no-loop-func */
      const subaccountRow = reduce(
        columns,
        (obj: { [key: string]: any }, col: ColumnType) => {
          if (
            !isNil(subaccount[col.field as keyof Model.PdfSubAccount]) &&
            (details.length === 0 || col.isCalculated !== true)
          ) {
            obj[col.field] = subaccount[col.field as keyof Model.PdfSubAccount];
          } else {
            obj[col.field] = null;
          }
          return obj;
        },
        {}
      ) as BudgetPdf.SubAccountRow;

      rows.push(
        <BodyRow
          key={runningIndex}
          index={runningIndex}
          cellProps={{ className: "subaccount-td", textClassName: "subaccount-tr-td-text" }}
          className={"subaccount-tr"}
          columns={columns}
          row={subaccountRow}
        />
      );
      runningIndex += 1;

      forEach(details, (detail: Model.PdfSubAccount, j: number) => {
        const detailRow = manager.modelToRow(detail);
        rows.push(
          <BodyRow<BudgetPdf.SubAccountRow, Model.PdfSubAccount>
            key={runningIndex}
            index={runningIndex}
            columns={columns}
            className={"detail-tr"}
            row={detailRow}
            cellProps={{
              cellContentsVisible: (
                params: Table.PdfCellCallbackParams<BudgetPdf.SubAccountRow, Model.PdfSubAccount>
              ) => (params.column.field === "identifier" ? false : true),
              textClassName: "detail-tr-td-text",
              className: (params: Table.PdfCellCallbackParams<BudgetPdf.SubAccountRow, Model.PdfSubAccount>) => {
                if (params.column.field === "description") {
                  return classNames("detail-td", "indent-td");
                }
                return "detail-td";
              }
            }}
            style={!isLastSubAccount && !showFooterRow && j === details.length - 1 ? { borderBottomWidth: 1 } : {}}
          />
        );
        runningIndex += 1;
      });
      if (showSubAccountFooterRow === true) {
        const blockFooterRow = reduce(
          columns,
          (obj: { [key: string]: any }, col: ColumnType) => {
            if (!isNil(col.childFooter) && !isNil(col.childFooter(subaccount).value)) {
              obj[col.field] = col.childFooter(subaccount).value;
            } else {
              obj[col.field] = null;
            }
            return obj;
          },
          {}
        ) as BudgetPdf.SubAccountRow;

        rows.push(
          <BodyRow
            key={runningIndex}
            index={runningIndex}
            className={"subaccount-footer-tr"}
            cellProps={{ className: "subaccount-footer-td", textClassName: "subaccount-footer-tr-td-text" }}
            columns={columns}
            row={blockFooterRow}
            style={!isLastSubAccount ? { borderBottomWidth: 1 } : {}}
          />
        );
        runningIndex += 1;
      }
    });
    if (showFooterRow === true) {
      rows.push(<FooterRow index={runningIndex} key={runningIndex} columns={columns} />);
    }
    return rows;
  });

  return <Table>{generateRows()}</Table>;
};

export default AccountTable;

import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";
import { isNil, map, filter, includes } from "lodash";
import { Column } from "@ag-grid-community/core";

import { tabling } from "lib";
import { framework } from "components/tabling/generic";

type R = Tables.AccountRow;
type M = Model.Account;

export type AccountsTableProps = {
  readonly tableRef?: NonNullRef<Table.ReadOnlyTableRefObj<R, M>> | NonNullRef<BudgetTable.ReadWriteTableRefObj<R, M>>;
  readonly budget?: Model.Budget | Model.Template;
  readonly cookieNames?: Omit<Table.CookieNames, "hiddenColumns">;
};

export type WithAccountsTableProps<T extends AccountsTableProps> = T & AccountsTableInnerProps;

type AccountsTableInnerProps = {
  readonly columns: Table.Column<R, M>[];
  readonly levelType: "budget";
  readonly showPageFooter: false;
  readonly getRowName: "Account";
  readonly getRowChildren: (m: M) => number[];
};

const AccountsTable = <T extends AccountsTableProps>(
  Component: React.ComponentClass<WithAccountsTableProps<T>, {}> | React.FunctionComponent<WithAccountsTableProps<T>>
): React.FunctionComponent<T> => {
  const WithAccountsTable = (props: T) => {
    // Since this component is used for both Read and Write cases, we cannot assume that
    // it is a ReadWrite or ReadOnly ref - but this is still needed here.
    const tableRef = tabling.hooks.useReadOnlyTableIfNotDefined(props.tableRef);
    return (
      <Component
        {...props}
        tableRef={tableRef}
        levelType={"budget"}
        showPageFooter={false}
        getRowName={"Account"}
        cookieNames={{ ...props.cookieNames, hiddenColumns: "account-table-hidden-columns" }}
        getRowChildren={(m: M) => m.subaccounts}
        getRowLabel={(m: M) => m.identifier || m.description}
        actions={(params: Table.ReadOnlyMenuActionParams<R, M>) => [
          framework.actions.ToggleColumnAction<R, M>(tableRef.current, params),
          framework.actions.ExportCSVAction(
            tableRef.current,
            params,
            !isNil(props.budget) ? `${props.budget.type}_${props.budget.name}_accounts` : ""
          )
        ]}
        columns={[
          framework.columnObjs.BodyColumn({
            field: "identifier",
            columnType: "number",
            headerName: "Account",
            footer: {
              value: !isNil(props.budget) ? `${props.budget.name} Total` : "Total",
              // We always want the text in the identifier cell to be present, but the column
              // itself isn't always wide enough.  However, applying a colSpan conflicts with the
              // colSpan of the main data grid, causing weird behavior.
              cellStyle: { zIndex: 1000, overflow: "visible", whiteSpace: "unset", textAlign: "left" }
            },
            index: 0,
            cellRenderer: "IdentifierCell",
            width: 100,
            maxWidth: 100,
            suppressSizeToFit: true,
            cellStyle: { textAlign: "left" },
            colSpan: (params: Table.ColSpanParams<R, M>) => {
              const row: R = params.data;
              if (row.meta.isGroupRow === true) {
                /*
                Note: We have to look at all of the visible columns that are present up until
                the calculated columns.  This means we have to use the AG Grid ColumnApi (not our
                own columns).
                */
                const agColumns: Column[] | undefined = params.columnApi?.getAllDisplayedColumns();
                if (!isNil(agColumns)) {
                  const readColumns: Table.Field<R, M>[] = map(
                    filter(params.columns, (c: Table.Column<R, M>) => {
                      const fieldBehavior: Table.FieldBehavior[] = c.fieldBehavior || ["read", "write"];
                      return includes(fieldBehavior, "read") && c.tableColumnType !== "calculated";
                    }),
                    (c: Table.Column<R, M>) => c.field
                  );
                  const readableAgColumns = filter(agColumns, (c: Column) => includes(readColumns, c.getColId()));
                  return readableAgColumns.length;
                }
              }
              return 1;
            }
          }),
          framework.columnObjs.BodyColumn({
            field: "description",
            headerName: "Account Description",
            flex: 100,
            columnType: "longText"
          })
        ]}
      />
    );
  };
  return hoistNonReactStatics(WithAccountsTable, Component);
};

export default AccountsTable;

import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";
import { isNil } from "lodash";

import { tabling } from "lib";
import { framework } from "components/tabling/generic";
import { framework as budgetFramework } from "../BudgetTable";

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
          budgetFramework.columnObjs.IdentifierColumn({
            field: "identifier",
            tableFooterLabel: !isNil(props.budget) ? `${props.budget.name} Total` : "Total",
            headerName: "Account"
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

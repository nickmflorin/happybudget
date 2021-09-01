import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";
import { isNil } from "lodash";

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
    return (
      <Component
        {...props}
        levelType={"budget"}
        showPageFooter={false}
        getRowName={"Account"}
        cookieNames={{ ...props.cookieNames, hiddenColumns: "account-table-hidden-columns" }}
        getRowChildren={(m: M) => m.subaccounts}
        getRowLabel={(m: M) => m.identifier || m.description}
        columns={[
          budgetFramework.columnObjs.IdentifierColumn({
            field: "identifier",
            tableFooterLabel: !isNil(props.budget) ? `${props.budget.name} Total` : "Total",
            headerName: "Account"
          }),
          framework.columnObjs.BodyColumn({
            field: "description",
            headerName: "Account Description",
            minWidth: 200,
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

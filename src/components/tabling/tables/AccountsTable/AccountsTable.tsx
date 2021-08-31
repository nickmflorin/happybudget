import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";

type M = Model.Account;
type R = Tables.AccountRowData;

export type AccountsTableProps = {
  readonly tableRef?: NonNullRef<Table.UnauthenticatedTableRefObj<R>> | NonNullRef<Table.AuthenticatedTableRefObj<R>>;
  readonly budget?: Model.Budget | Model.Template;
  readonly cookieNames?: Omit<Table.CookieNames, "hiddenColumns">;
};

export type WithAccountsTableProps<T extends AccountsTableProps> = T & AccountsTableInnerProps;

type AccountsTableInnerProps = {
  readonly showPageFooter: false;
  readonly getRowName: "Account";
  readonly getRowChildren: (m: M) => ID[];
};

const AccountsTable = <T extends AccountsTableProps>(
  Component: React.ComponentClass<WithAccountsTableProps<T>, {}> | React.FunctionComponent<WithAccountsTableProps<T>>
): React.FunctionComponent<T> => {
  const WithAccountsTable = (props: T) => {
    return (
      <Component
        {...props}
        showPageFooter={false}
        getRowName={"Account"}
        cookieNames={{ ...props.cookieNames, hiddenColumns: "account-table-hidden-columns" }}
        getRowChildren={(m: M) => m.subaccounts}
        getRowLabel={(m: M) => m.identifier || m.description}
      />
    );
  };
  return hoistNonReactStatics(WithAccountsTable, Component);
};

export default AccountsTable;

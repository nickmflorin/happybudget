import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";

type R = Tables.AccountRowData;

export type AccountsTableProps = {
  readonly tableRef?: NonNullRef<Table.UnauthenticatedTableRefObj<R>> | NonNullRef<Table.AuthenticatedTableRefObj<R>>;
  readonly cookieNames?: Omit<Table.CookieNames, "hiddenColumns">;
};

const AccountsTable = <T extends AccountsTableProps>(
  Component: React.ComponentClass<T, {}> | React.FunctionComponent<T>
): React.FunctionComponent<T> => {
  const WithAccountsTable = (props: T) => {
    return (
      <Component
        {...props}
        showPageFooter={false}
        cookieNames={{ ...props.cookieNames, hiddenColumns: "account-table-hidden-columns" }}
      />
    );
  };
  return hoistNonReactStatics(WithAccountsTable, Component);
};

export default AccountsTable;

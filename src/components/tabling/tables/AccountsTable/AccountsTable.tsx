import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";

type R = Tables.AccountRowData;
type M = Model.Account;

export type AccountsTableProps = {
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
        getModelRowName={(r: Table.ModelRow<R>) => r.data.identifier || r.data.description}
        getPlaceholderRowName={(r: Table.PlaceholderRow<R>) => r.data.identifier || r.data.description}
        getMarkupRowName={(r: Table.MarkupRow<R>) => r.data.identifier}
        getMarkupRowLabel={"Markup"}
        getModelRowLabel={"Account"}
        getPlaceholderRowLabel={"Account"}
      />
    );
  };
  return hoistNonReactStatics(WithAccountsTable, Component);
};

export default AccountsTable;

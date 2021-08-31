import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";

import { Framework } from "./framework";

export type SubAccountsTableProps = {
  readonly cookieNames?: Omit<Table.CookieNames, "hiddenColumns">;
};

type SubAccountsTableInnerProps = {
  readonly getRowChildren: (m: Model.SubAccount) => ID[];
};

export type WithSubAccountsTableProps<T> = T & SubAccountsTableInnerProps;

function SubAccountsTable<T extends SubAccountsTableProps>(
  Component:
    | React.ComponentClass<WithSubAccountsTableProps<T>, {}>
    | React.FunctionComponent<WithSubAccountsTableProps<T>>
): React.FunctionComponent<T> {
  const WithSubAccountsTable = (props: T): JSX.Element => {
    return (
      <Component
        {...props}
        getRowChildren={(m: Model.SubAccount) => m.subaccounts}
        showPageFooter={true}
        cookieNames={{ ...props.cookieNames, hiddenColumns: "subaccount-table-hidden-columns" }}
        framework={Framework}
      />
    );
  };
  return hoistNonReactStatics(WithSubAccountsTable, Component);
}

export default SubAccountsTable;

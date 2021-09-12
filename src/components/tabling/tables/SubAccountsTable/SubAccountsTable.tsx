import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";

import { Framework } from "./framework";

export type SubAccountsTableProps = {
  readonly cookieNames?: Omit<Table.CookieNames, "hiddenColumns">;
};

function SubAccountsTable<T extends SubAccountsTableProps>(
  Component: React.ComponentClass<T, {}> | React.FunctionComponent<T>
): React.FunctionComponent<T> {
  const WithSubAccountsTable = (props: T): JSX.Element => {
    return (
      <Component
        {...props}
        showPageFooter={true}
        cookieNames={{ ...props.cookieNames, hiddenColumns: "subaccount-table-hidden-columns" }}
        framework={Framework}
      />
    );
  };
  return hoistNonReactStatics(WithSubAccountsTable, Component);
}

export default SubAccountsTable;

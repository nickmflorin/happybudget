import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";

import { Framework } from "./framework";
import Columns from "./Columns";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;
type G = Model.BudgetGroup;

type SubAccountsTableProps = {
  readonly cookieNames?: Omit<Table.CookieNames, "hiddenColumns">;
};

export type WithSubAccountsTableProps<T> = T & {
  readonly columns: Table.Column<R, M, G>[];
};

function SubAccountsTable<T extends SubAccountsTableProps>(
  Component:
    | React.ComponentClass<WithSubAccountsTableProps<T>, {}>
    | React.FunctionComponent<WithSubAccountsTableProps<T>>
): React.FunctionComponent<T> {
  const WithSubAccountsTable = (props: T): JSX.Element => {
    return (
      <Component
        {...props}
        columns={Columns}
        showPageFooter={true}
        cookieNames={{ ...props.cookieNames, hiddenColumns: "subaccount-table-hidden-columns" }}
        framework={Framework}
      />
    );
  };
  return hoistNonReactStatics(WithSubAccountsTable, Component);
}

export default SubAccountsTable;

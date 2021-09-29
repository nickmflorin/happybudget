import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";

import { Framework } from "./framework";
import Columns from "./Columns";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;

type SubAccountsTableProps = {
  readonly cookieNames?: Omit<Table.CookieNames, "hiddenColumns">;
};

export type WithSubAccountsTableProps<T> = T & {
  readonly columns: Table.Column<R, M>[];
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
        getModelRowName={(r: Table.ModelRow<R>) => r.data.identifier || r.data.description}
        getPlaceholderRowName={(r: Table.PlaceholderRow<R>) => r.data.identifier || r.data.description}
        getMarkupRowName={(r: Table.MarkupRow<R>) => r.data.identifier}
        getMarkupRowLabel={"Markup"}
        getModelRowLabel={"Sub Account"}
        getPlaceholderRowLabel={"Sub Account"}
      />
    );
  };
  return hoistNonReactStatics(WithSubAccountsTable, Component);
}

export default SubAccountsTable;

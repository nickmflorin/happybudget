import React from "react";
import hoistNonReactStatics from "hoist-non-react-statics";

type R = Tables.AccountRowData;

export type AccountsTableProps = {
  readonly actionContext: Tables.AccountTableContext;
  readonly cookieNames?: Omit<Table.CookieNames, "hiddenColumns">;
};

const AccountsTable = <T extends AccountsTableProps>(
  Component: React.ComponentClass<T, Record<string, unknown>> | React.FunctionComponent<T>
): React.FunctionComponent<T> => {
  const WithAccountsTable = (props: T) => {
    return (
      <Component
        {...props}
        showPageFooter={false}
        pinFirstColumn={true}
        cookieNames={{ ...props.cookieNames, hiddenColumns: "account-table-hidden-columns" }}
        getModelRowName={(r: Table.DataRow<R>) => r.data.identifier || r.data.description}
        getMarkupRowName={(r: Table.MarkupRow<R>) => r.data.identifier}
        getMarkupRowLabel={"Markup"}
        getModelRowLabel={"Account"}
      />
    );
  };
  return hoistNonReactStatics(WithAccountsTable, Component);
};

export default AccountsTable;

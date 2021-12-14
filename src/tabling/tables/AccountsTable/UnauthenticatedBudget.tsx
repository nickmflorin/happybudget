import React from "react";
import { isNil } from "lodash";

import { tabling } from "lib";
import { framework } from "tabling/generic";

import { UnauthenticatedBudgetTable, UnauthenticatedBudgetTableProps } from "../BudgetTable";
import AccountsTable, { AccountsTableProps } from "./AccountsTable";
import Columns from "./Columns";

type M = Model.Account;
type R = Tables.AccountRowData;

export type UnauthenticatedBudgetProps = AccountsTableProps &
  Omit<UnauthenticatedBudgetTableProps<R, M>, "cookieNames" | "columns"> & {
    readonly budget: Model.Budget | null;
    readonly cookieNames?: Table.CookieNames;
  };

const UnauthenticatedBudgetAccountsTable = (props: UnauthenticatedBudgetProps): JSX.Element => {
  const tableRef = tabling.hooks.useTableIfNotDefined(props.table);

  return (
    <UnauthenticatedBudgetTable<R, M>
      {...props}
      actions={(params: Table.UnauthenticatedMenuActionParams<R, M>) => [
        ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
        framework.actions.ToggleColumnAction<R, M>(tableRef.current, params),
        framework.actions.ExportCSVAction<R, M>(
          tableRef.current,
          params,
          !isNil(props.budget) ? `${props.budget.type}_${props.budget.name}_accounts` : ""
        )
      ]}
      columns={tabling.columns.normalizeColumns<R, M>(Columns)}
    />
  );
};

export default React.memo(AccountsTable<UnauthenticatedBudgetProps>(UnauthenticatedBudgetAccountsTable));

import React from "react";
import { isNil } from "lodash";

import { tabling } from "lib";
import { framework } from "tabling/generic";

import { PublicBudgetTable, PublicBudgetTableProps } from "../BudgetTable";
import AccountsTable, { AccountsTableProps } from "./AccountsTable";
import Columns from "./Columns";

type M = Model.Account;
type R = Tables.AccountRowData;

export type PublicBudgetProps = AccountsTableProps &
  Omit<PublicBudgetTableProps<R, M>, "cookieNames" | "columns"> & {
    readonly budget: Model.Budget | null;
    readonly cookieNames?: Table.CookieNames;
  };

const PublicBudgetAccountsTable = (props: PublicBudgetProps): JSX.Element => (
  <PublicBudgetTable<R, M>
    {...props}
    actions={(params: Table.PublicMenuActionParams<R, M>) => [
      ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
      framework.actions.ToggleColumnAction<R, M>(props.table.current, params),
      framework.actions.ExportCSVAction<R, M>(
        props.table.current,
        params,
        !isNil(props.budget) ? `${props.budget.type}_${props.budget.name}_accounts` : ""
      )
    ]}
    columns={tabling.columns.normalizeColumns(Columns)}
  />
);

export default React.memo(AccountsTable<PublicBudgetProps>(PublicBudgetAccountsTable));

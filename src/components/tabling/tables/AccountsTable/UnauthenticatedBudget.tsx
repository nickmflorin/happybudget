import { isNil } from "lodash";

import { tabling } from "lib";
import { framework } from "components/tabling/generic";

import { UnauthenticatedBudgetTable, UnauthenticatedBudgetTableProps } from "../BudgetTable";
import AccountsTable, { WithAccountsTableProps, AccountsTableProps } from "./AccountsTable";
import { BudgetColumns } from "./Columns";

type M = Model.Account;
type R = Tables.AccountRowData;

export type UnauthenticatedBudgetProps = AccountsTableProps &
  Omit<UnauthenticatedBudgetTableProps<R, M>, "cookieNames" | "columns" | "getRowChildren"> & {
    readonly budget?: Model.Budget;
    readonly tableRef?: NonNullRef<Table.UnauthenticatedTableRefObj<R>>;
    readonly cookieNames?: Table.CookieNames;
  };

const UnauthenticatedBudgetAccountsTable = (props: WithAccountsTableProps<UnauthenticatedBudgetProps>): JSX.Element => {
  const tableRef = tabling.hooks.useUnauthenticatedTableIfNotDefined(props.tableRef);

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
      columns={tabling.columns.mergeColumns<Table.Column<R, M>, R, M>(BudgetColumns, {
        identifier: (col: Table.Column<R, M>) => ({
          ...col,
          tableFooterLabel: !isNil(props.budget) ? `${props.budget.name} Total` : "Total"
        }),
        estimated: {
          footer: {
            value: !isNil(props.budget) && !isNil(props.budget.estimated) ? props.budget.estimated : 0.0
          }
        },
        actual: {
          footer: {
            value: !isNil(props.budget) && !isNil(props.budget.actual) ? props.budget.actual : 0.0
          }
        },
        variance: {
          footer: {
            value: !isNil(props.budget) && !isNil(props.budget.variance) ? props.budget.variance : 0.0
          }
        }
      })}
    />
  );
};

export default AccountsTable<UnauthenticatedBudgetProps>(UnauthenticatedBudgetAccountsTable);

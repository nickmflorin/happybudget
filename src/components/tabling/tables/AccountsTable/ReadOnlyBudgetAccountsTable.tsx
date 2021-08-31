import { isNil } from "lodash";

import { tabling } from "lib";
import { framework } from "components/tabling/generic";

import { ReadOnlyBudgetTable, ReadOnlyBudgetTableProps } from "../BudgetTable";
import AccountsTable, { WithAccountsTableProps, AccountsTableProps } from "./AccountsTable";

type R = Tables.AccountRow;
type M = Model.Account;

export type ReadOnlyBudgetAccountsTableProps = AccountsTableProps &
  Omit<ReadOnlyBudgetTableProps<R, M>, "cookieNames" | "budgetType" | "columns" | "levelType" | "getRowChildren"> & {
    readonly budget?: Model.Budget;
    readonly tableRef?: NonNullRef<Table.ReadOnlyTableRefObj<R, M>>;
    readonly cookieNames?: Table.CookieNames;
  };

const ReadOnlyBudgetAccountsTable = (props: WithAccountsTableProps<ReadOnlyBudgetAccountsTableProps>): JSX.Element => {
  const tableRef = tabling.hooks.useReadOnlyTableIfNotDefined(props.tableRef);

  return (
    <ReadOnlyBudgetTable<R, M>
      {...props}
      actions={(params: Table.ReadOnlyMenuActionParams<R, M>) => [
        ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
        framework.actions.ToggleColumnAction<R, M>(tableRef.current, params),
        framework.actions.ExportCSVAction(
          tableRef.current,
          params,
          !isNil(props.budget) ? `${props.budget.type}_${props.budget.name}_accounts` : ""
        )
      ]}
      columns={[
        ...props.columns,
        framework.columnObjs.CalculatedColumn({
          field: "estimated",
          headerName: "Estimated",
          footer: {
            value: !isNil(props.budget) && !isNil(props.budget.estimated) ? props.budget.estimated : 0.0
          }
        }),
        framework.columnObjs.CalculatedColumn({
          field: "actual",
          headerName: "Actual",
          footer: {
            value: !isNil(props.budget) && !isNil(props.budget.actual) ? props.budget.actual : 0.0
          }
        }),
        framework.columnObjs.CalculatedColumn({
          field: "variance",
          headerName: "Variance",
          footer: {
            value: !isNil(props.budget) && !isNil(props.budget.variance) ? props.budget.variance : 0.0
          }
        })
      ]}
      budgetType={"budget"}
    />
  );
};

export default AccountsTable<ReadOnlyBudgetAccountsTableProps>(ReadOnlyBudgetAccountsTable);

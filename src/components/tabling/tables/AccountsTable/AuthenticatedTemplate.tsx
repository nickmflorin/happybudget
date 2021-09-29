import { isNil, filter } from "lodash";

import { tabling } from "lib";
import { framework } from "components/tabling/generic";

import { AuthenticatedBudgetTable, AuthenticatedBudgetTableProps } from "../BudgetTable";
import AccountsTable, { AccountsTableProps } from "./AccountsTable";
import Columns from "./Columns";

type M = Model.Account;
type R = Tables.AccountRowData;

export type AuthenticatedTemplateProps = AccountsTableProps &
  Omit<AuthenticatedBudgetTableProps<R, M>, "columns" | "cookieNames"> & {
    readonly budget: Model.Template | null;
    readonly cookieNames?: Table.CookieNames;
  };

const AuthenticatedTemplateAccountsTable = (props: AuthenticatedTemplateProps): JSX.Element => {
  const table = tabling.hooks.useTableIfNotDefined<R, M>(props.table);

  return (
    <AuthenticatedBudgetTable<R, M>
      {...props}
      excludeColumns={["actual", (col: Table.Column<R, M>) => col.headerName === "Variance"]}
      actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
        {
          icon: "folder",
          label: "Group",
          isWriteOnly: true,
          onClick: () => {
            const rows: Table.Row<R, M>[] = table.current.getRowsAboveAndIncludingFocusedRow();
            const modelRows: Table.ModelRow<R, M>[] = filter(rows, (r: Table.Row<R, M>) =>
              tabling.typeguards.isModelRow(r)
            ) as Table.ModelRow<R, M>[];
            if (modelRows.length !== 0) {
              props.onGroupRows?.(modelRows);
            }
          }
        },
        ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
        framework.actions.ToggleColumnAction<R, M>(table.current, params),
        framework.actions.ExportCSVAction<R, M>(
          table.current,
          params,
          !isNil(props.budget) ? `${props.budget.type}_${props.budget.name}_accounts` : ""
        )
      ]}
      columns={tabling.columns.mergeColumns<Table.Column<R, M>, R, M>(Columns, {
        identifier: (col: Table.Column<R, M>) => ({
          ...col,
          cellRendererParams: {
            ...col.cellRendererParams,
            onGroupEdit: props.onEditGroup
          }
        })
      })}
    />
  );
};

export default AccountsTable<AuthenticatedTemplateProps>(AuthenticatedTemplateAccountsTable);

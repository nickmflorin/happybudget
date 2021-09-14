import { isNil } from "lodash";

import { tabling } from "lib";
import { framework } from "components/tabling/generic";

import { AuthenticatedBudgetTable, AuthenticatedBudgetTableProps } from "../BudgetTable";
import AccountsTable, { AccountsTableProps } from "./AccountsTable";
import { TemplateColumns } from "./Columns";

type M = Model.Account;
type R = Tables.AccountRowData;

export type AuthenticatedTemplateProps = AccountsTableProps &
  Omit<AuthenticatedBudgetTableProps<R, M>, "columns" | "cookieNames"> & {
    readonly budget: Model.Template | null;
    readonly cookieNames?: Table.CookieNames;
    readonly onEditGroup: (group: Table.GroupRow<R>) => void;
  };

const AuthenticatedTemplateAccountsTable = (props: AuthenticatedTemplateProps): JSX.Element => {
  const table = tabling.hooks.useTableIfNotDefined<R, M, Model.BudgetGroup>(props.table);

  return (
    <AuthenticatedBudgetTable<R, M>
      {...props}
      actions={(params: Table.AuthenticatedMenuActionParams<R, M, Model.BudgetGroup>) => [
        {
          icon: "folder",
          disabled: true,
          label: "Group",
          isWriteOnly: true
        },
        ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
        framework.actions.ToggleColumnAction<R, M, Model.BudgetGroup>(table.current, params),
        framework.actions.ExportCSVAction<R, M, Model.BudgetGroup>(
          table.current,
          params,
          !isNil(props.budget) ? `${props.budget.type}_${props.budget.name}_accounts` : ""
        )
      ]}
      columns={tabling.columns.mergeColumns<Table.Column<R, M, Model.BudgetGroup>, R, M, Model.BudgetGroup>(
        TemplateColumns,
        {
          identifier: (col: Table.Column<R, M, Model.BudgetGroup>) => ({
            ...col,
            cellRendererParams: {
              ...col.cellRendererParams,
              onGroupEdit: props.onEditGroup
            }
          })
        }
      )}
    />
  );
};

export default AccountsTable<AuthenticatedTemplateProps>(AuthenticatedTemplateAccountsTable);

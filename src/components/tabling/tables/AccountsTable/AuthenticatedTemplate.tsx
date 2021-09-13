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
    readonly tableRef?: NonNullRef<Table.AuthenticatedTableRefObj<R>>;
    readonly cookieNames?: Table.CookieNames;
    readonly onEditGroup: (group: Model.BudgetGroup) => void;
  };

const AuthenticatedTemplateAccountsTable = (props: AuthenticatedTemplateProps): JSX.Element => {
  const tableRef = tabling.hooks.useAuthenticatedTableIfNotDefined<R>(props.tableRef);

  return (
    <AuthenticatedBudgetTable<R, M>
      {...props}
      actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
        {
          icon: "folder",
          disabled: true,
          label: "Group",
          isWriteOnly: true
        },
        ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
        framework.actions.ToggleColumnAction<R, M>(tableRef.current, params),
        framework.actions.ExportCSVAction<R, M>(
          tableRef.current,
          params,
          !isNil(props.budget) ? `${props.budget.type}_${props.budget.name}_accounts` : ""
        )
      ]}
      columns={tabling.columns.mergeColumns<Table.Column<R, M>, R, M>(TemplateColumns, {
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

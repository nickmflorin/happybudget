import { isNil } from "lodash";

import { tabling } from "lib";
import { framework } from "components/tabling/generic";

import { AuthenticatedBudgetTable, AuthenticatedBudgetTableProps } from "../BudgetTable";
import AccountsTable, { AccountsTableProps } from "./AccountsTable";
import { BudgetColumns } from "./Columns";

type R = Tables.AccountRowData;
type M = Model.Account;

export type AuthenticatedBudgetProps = AccountsTableProps &
  Omit<AuthenticatedBudgetTableProps<R, M>, "columns" | "cookieNames"> & {
    readonly budget?: Model.Budget;
    readonly tableRef?: NonNullRef<Table.AuthenticatedTableRefObj<R>>;
    readonly cookieNames?: Table.CookieNames;
    readonly onExportPdf: () => void;
    readonly onEditGroup: (group: Model.BudgetGroup) => void;
  };

const AuthenticatedBudgetAccountsTable = (props: AuthenticatedBudgetProps): JSX.Element => {
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
        {
          icon: "badge-percent",
          disabled: true,
          label: "Mark Up",
          isWriteOnly: true
        },
        ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
        framework.actions.ToggleColumnAction<R, M>(tableRef.current, params),
        framework.actions.ExportPdfAction(props.onExportPdf),
        framework.actions.ExportCSVAction<R, M>(
          tableRef.current,
          params,
          !isNil(props.budget) ? `${props.budget.type}_${props.budget.name}_accounts` : ""
        )
      ]}
      columns={tabling.columns.mergeColumns<Table.Column<R, M>, R, M>(BudgetColumns, {
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

export default AccountsTable<AuthenticatedBudgetProps>(AuthenticatedBudgetAccountsTable);

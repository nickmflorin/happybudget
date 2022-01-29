import React from "react";
import { isNil, filter } from "lodash";

import { tabling } from "lib";
import { framework } from "tabling/generic";

import { AuthenticatedBudgetTable, AuthenticatedBudgetTableProps } from "../BudgetTable";
import AccountsTable, { AccountsTableProps } from "./AccountsTable";
import Columns from "./Columns";

type R = Tables.AccountRowData;
type M = Model.Account;

export type AuthenticatedBudgetProps = AccountsTableProps &
  Omit<AuthenticatedBudgetTableProps<R, M>, "columns" | "cookieNames"> & {
    readonly budget: Model.Budget | null;
    readonly cookieNames?: Table.CookieNames;
    readonly onExportPdf: () => void;
  };

const AuthenticatedBudgetAccountsTable = (props: AuthenticatedBudgetProps): JSX.Element => {
  return (
    <AuthenticatedBudgetTable<R, M>
      {...props}
      actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
        {
          icon: "folder",
          label: "Subtotal",
          isWriteOnly: true,
          onClick: () => {
            const rows: Table.BodyRow<R>[] = props.table.current.getRowsAboveAndIncludingFocusedRow();
            const modelRows: Table.ModelRow<R>[] = filter(rows, (r: Table.BodyRow<R>) =>
              tabling.typeguards.isModelRow(r)
            ) as Table.ModelRow<R>[];
            if (modelRows.length !== 0) {
              props.onGroupRows?.(modelRows);
            }
          }
        },
        {
          icon: "badge-percent",
          label: "Mark Up",
          isWriteOnly: true,
          onClick: () => {
            const selectedRows = filter(params.selectedRows, (r: Table.BodyRow<R>) =>
              tabling.typeguards.isModelRow(r)
            ) as Table.ModelRow<R>[];

            const rows: Table.ModelRow<R>[] =
              selectedRows.length !== 0
                ? selectedRows
                : (filter(props.table.current.getRows(), (r: Table.BodyRow<R>) =>
                    tabling.typeguards.isModelRow(r)
                  ) as Table.ModelRow<R>[]);
            if (rows.length !== 0) {
              props.onMarkupRows?.(rows);
            }
          }
        },
        ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
        framework.actions.ToggleColumnAction<R, M>(props.table.current, params),
        framework.actions.ExportPdfAction(props.onExportPdf),
        framework.actions.ExportCSVAction<R, M>(
          props.table.current,
          params,
          !isNil(props.budget) ? `${props.budget.type}_${props.budget.name}_accounts` : ""
        )
      ]}
      columns={tabling.columns.filterRealColumns(Columns)}
    />
  );
};

export default React.memo(AccountsTable<AuthenticatedBudgetProps>(AuthenticatedBudgetAccountsTable));

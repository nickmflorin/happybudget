import { isNil } from "lodash";

import { tabling } from "lib";
import { framework } from "components/tabling/generic";

import {
  AuthenticatedBudgetTable,
  AuthenticatedBudgetTableProps,
  framework as budgetTableFramework
} from "../BudgetTable";
import SubAccountsTable, { WithSubAccountsTableProps } from "./SubAccountsTable";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;

export type AuthenticatedTemplateProps = Omit<AuthenticatedBudgetTableProps<R, M>, "columns"> & {
  readonly subAccountUnits: Model.Tag[];
  readonly fringes: Table.Row<Tables.FringeRowData>[];
  readonly categoryName: "Sub Account" | "Detail";
  readonly identifierFieldHeader: "Account" | "Line";
  readonly cookieNames: Table.CookieNames;
  readonly exportFileName: string;
  readonly onEditGroup: (group: Model.BudgetGroup) => void;
  readonly onAddFringes: () => void;
  readonly onEditFringes: () => void;
};

const AuthenticatedTemplateSubAccountsTable = (
  props: WithSubAccountsTableProps<AuthenticatedTemplateProps>
): JSX.Element => {
  const table = tabling.hooks.useTableIfNotDefined<R, M, Model.BudgetGroup>(props.table);

  return (
    <AuthenticatedBudgetTable<R, M>
      {...props}
      table={table}
      excludeColumns={["actual", "contact", "variance"]}
      columns={tabling.columns.mergeColumns<Table.Column<R, M>, R, M>(props.columns, {
        identifier: (col: Table.Column<R, M>) =>
          budgetTableFramework.columnObjs.IdentifierColumn<R, M>({
            ...col,
            cellRendererParams: {
              ...col.cellRendererParams,
              onGroupEdit: props.onEditGroup
            },
            headerName: props.identifierFieldHeader
          }),
        description: { headerName: `${props.categoryName} Description` },
        unit: (col: Table.Column<R, M>) =>
          framework.columnObjs.TagSelectColumn<R, M>({ ...col, models: props.subAccountUnits })
      })}
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
        framework.actions.ToggleColumnAction<R, M, Model.BudgetGroup>(table.current, params),
        framework.actions.ExportCSVAction<R, M, Model.BudgetGroup>(table.current, params, props.exportFileName)
      ]}
    />
  );
};

export default SubAccountsTable<AuthenticatedTemplateProps>(AuthenticatedTemplateSubAccountsTable);

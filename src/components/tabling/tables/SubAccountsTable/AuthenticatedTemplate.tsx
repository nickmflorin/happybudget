import { isNil } from "lodash";

import { tabling } from "lib";

import { framework } from "components/tabling/generic";

import {
  AuthenticatedBudgetTable,
  AuthenticatedBudgetTableProps,
  framework as budgetTableFramework
} from "../BudgetTable";
import SubAccountsTable, { WithSubAccountsTableProps } from "./SubAccountsTable";
import { AuthenticatedTemplateColumns } from "./Columns";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;

export type AuthenticatedTemplateProps = Omit<
  Omit<AuthenticatedBudgetTableProps<R, M>, "columns" | "getRowChildren"> &
    WithSubAccountsTableProps<{
      readonly tableFooterIdentifierValue: string;
      readonly subAccountUnits: Model.Tag[];
      readonly fringes: Table.Row<Tables.FringeRowData>[];
      readonly categoryName: "Sub Account" | "Detail";
      readonly identifierFieldHeader: "Account" | "Line";
      readonly budget?: Model.Template;
      readonly tableRef?: NonNullRef<Table.AuthenticatedTableRefObj<R>>;
      readonly cookieNames: Table.CookieNames;
      readonly detail: Model.Account | M | undefined;
      readonly exportFileName: string;
      readonly onEditGroup: (group: Model.BudgetGroup) => void;
      readonly onAddFringes: () => void;
      readonly onEditFringes: () => void;
    }>,
  "getRowChildren"
>;

const AuthenticatedTemplateSubAccountsTable = (
  props: WithSubAccountsTableProps<AuthenticatedTemplateProps>
): JSX.Element => {
  const tableRef = tabling.hooks.useAuthenticatedTableIfNotDefined<R>(props.tableRef);

  return (
    <AuthenticatedBudgetTable<R, M>
      {...props}
      tableRef={tableRef}
      columns={tabling.columns.mergeColumns<Table.Column<R, M>, R, M>(AuthenticatedTemplateColumns, {
        identifier: (col: Table.Column<R, M>) =>
          budgetTableFramework.columnObjs.IdentifierColumn<R, M>({
            ...col,
            cellRendererParams: {
              ...col.cellRendererParams,
              onGroupEdit: props.onEditGroup
            },
            tableFooterLabel: props.tableFooterIdentifierValue,
            pageFooterLabel: !isNil(props.budget) ? `${props.budget.name} Total` : "Budget Total",
            headerName: props.identifierFieldHeader
          }),
        description: { headerName: `${props.categoryName} Description` },
        unit: (col: Table.Column<R, M>) =>
          framework.columnObjs.TagSelectColumn<R, M>({ ...col, models: props.subAccountUnits }),
        estimated: {
          page: {
            value: !isNil(props.budget) && !isNil(props.budget.estimated) ? props.budget.estimated : 0.0
          },
          footer: {
            value: !isNil(props.budget) && !isNil(props.budget.estimated) ? props.budget.estimated : 0.0
          }
        }
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
        framework.actions.ToggleColumnAction<R, M>(tableRef.current, params),
        framework.actions.ExportCSVAction<R, M>(tableRef.current, params, props.exportFileName)
      ]}
    />
  );
};

export default SubAccountsTable<AuthenticatedTemplateProps>(AuthenticatedTemplateSubAccountsTable);

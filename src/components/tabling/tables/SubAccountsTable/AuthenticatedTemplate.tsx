import { isNil, filter } from "lodash";

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
  readonly exportFileName: string;
  readonly onAddFringes: () => void;
  readonly onEditFringes: () => void;
};

const AuthenticatedTemplateSubAccountsTable = (
  props: WithSubAccountsTableProps<AuthenticatedTemplateProps>
): JSX.Element => {
  const table = tabling.hooks.useTableIfNotDefined<R, M>(props.table);

  return (
    <AuthenticatedBudgetTable<R, M>
      {...props}
      table={table}
      excludeColumns={["actual", "contact", (col: Table.Column<R, M>) => col.headerName === "Variance"]}
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
        framework.actions.ExportCSVAction<R, M>(table.current, params, props.exportFileName)
      ]}
    />
  );
};

export default SubAccountsTable<AuthenticatedTemplateProps>(AuthenticatedTemplateSubAccountsTable);

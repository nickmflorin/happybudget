import { isNil, filter, map } from "lodash";

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
  readonly fringes: Table.BodyRow<Tables.FringeRowData>[];
  readonly categoryName: "Sub Account" | "Detail";
  readonly identifierFieldHeader: "Account" | "Line";
  readonly exportFileName: string;
  readonly onGroupRows: (rows: Table.ModelRow<R>[]) => void;
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
      generateNewRowData={(rows: Table.BodyRow<R>[]) => {
        const dataRows = filter(rows, (r: Table.BodyRow<R>) => tabling.typeguards.isDataRow(r)) as Table.DataRow<R>[];
        const numericIdentifiers: number[] = map(
          filter(dataRows, (r: Table.DataRow<R>) => !isNil(r.data.identifier) && !isNaN(parseInt(r.data.identifier))),
          (r: Table.DataRow<R>) => parseInt(r.data.identifier as string)
        );
        return { identifier: String(Math.max(...numericIdentifiers) + 1) };
      }}
      actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
        {
          icon: "folder",
          label: "Group",
          isWriteOnly: true,
          onClick: () => {
            const rows: Table.BodyRow<R>[] = table.current.getRowsAboveAndIncludingFocusedRow();
            const modelRows: Table.ModelRow<R>[] = filter(rows, (r: Table.BodyRow<R>) =>
              tabling.typeguards.isModelRow(r)
            ) as Table.ModelRow<R>[];
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

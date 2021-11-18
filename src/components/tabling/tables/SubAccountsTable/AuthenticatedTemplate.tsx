import { useMemo } from "react";
import { isNil, filter, map } from "lodash";

import { tabling, hooks, model } from "lib";
import { framework } from "components/tabling/generic";

import { AuthenticatedBudgetTable, AuthenticatedBudgetTableProps } from "../BudgetTable";
import SubAccountsTable, { WithSubAccountsTableProps } from "./SubAccountsTable";
import Columns from "./Columns";

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

  const processUnitCellFromClipboard = hooks.useDynamicCallback((name: string): Model.Tag | null =>
    model.util.inferModelFromName<Model.Tag>(props.subAccountUnits, name, { getName: (m: Model.Tag) => m.title })
  );

  const columns = useMemo(
    () =>
      tabling.columns.normalizeColumns(Columns, {
        identifier: (col: Table.Column<R, M>) => ({
          headerName: props.identifierFieldHeader
        }),
        description: { headerName: `${props.categoryName} Description` },
        unit: { processCellFromClipboard: processUnitCellFromClipboard }
      }),
    [props.identifierFieldHeader, hooks.useDeepEqualMemo(props.subAccountUnits)]
  );

  return (
    <AuthenticatedBudgetTable<R, M>
      {...props}
      table={table}
      excludeColumns={["actual", "contact", "variance", "attachment"]}
      columns={columns}
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
        {
          icon: "badge-percent",
          label: "Mark Up",
          isWriteOnly: true,
          onClick: () => {
            const selectedRows = filter(params.selectedRows, (r: Table.BodyRow<R>) =>
              tabling.typeguards.isModelRow(r)
            ) as Table.ModelRow<R>[];
            // If rows are explicitly selected for the Markup, we want to include them
            // as the default children for the Markup in the modal, which will default the
            // unit in the modal to PERCENT.
            if (selectedRows.length !== 0) {
              props.onMarkupRows?.(selectedRows);
            } else {
              const rows: Table.ModelRow<R>[] = filter(table.current.getRows(), (r: Table.BodyRow<R>) =>
                tabling.typeguards.isModelRow(r)
              ) as Table.ModelRow<R>[];
              if (rows.length !== 0) {
                props.onMarkupRows?.();
              }
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

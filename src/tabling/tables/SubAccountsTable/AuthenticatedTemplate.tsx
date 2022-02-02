import React, { useMemo } from "react";
import { isNil, filter, map } from "lodash";

import { tabling, hooks, models } from "lib";
import { framework } from "tabling/generic";

import { AuthenticatedBudgetTable, AuthenticatedBudgetTableProps } from "../BudgetTable";
import SubAccountsTable, { WithSubAccountsTableProps } from "./SubAccountsTable";
import Columns from "./Columns";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;

export type AuthenticatedTemplateProps = Omit<AuthenticatedBudgetTableProps<R, M>, "columns"> & {
  readonly actionContext: Tables.SubAccountTableContext;
  readonly subAccountUnits: Model.Tag[];
  readonly fringes: Tables.FringeRow[];
  readonly categoryName: "Sub Account" | "Detail";
  readonly identifierFieldHeader: "Account" | "Line";
  readonly exportFileName: string;
  readonly onEditMarkup: (row: Table.MarkupRow<R>) => void;
  readonly onMarkupRows: (rows?: Table.ModelRow<R>[]) => void;
  readonly onGroupRows: (rows: Table.ModelRow<R>[]) => void;
  readonly onAddFringes: () => void;
  readonly onEditFringes: () => void;
};

const AuthenticatedTemplateSubAccountsTable = (
  props: WithSubAccountsTableProps<AuthenticatedTemplateProps>
): JSX.Element => {
  const processUnitCellFromClipboard = hooks.useDynamicCallback((name: string): Model.Tag | null =>
    models.inferModelFromName<Model.Tag>(props.subAccountUnits, name, {
      getName: (m: Model.Tag) => m.title,
      warnOnMissing: false
    })
  );

  const processFringesCellForClipboard = hooks.useDynamicCallback((row: R) => {
    const fringes = models.getModels<Tables.FringeRow>(props.fringes, row.fringes, { modelName: "fringe" });
    return map(fringes, (fringe: Tables.FringeRow) => fringe.id).join(", ");
  });

  const processFringesCellFromClipboard = hooks.useDynamicCallback((value: string) => {
    /* Here, we convert from IDs to Rows then back to IDs to ensure that the
       IDs are valid. */
    return map(
      models.getModels<Tables.FringeRow>(props.fringes, models.parseIdsFromDeliminatedString(value), {
        warnOnMissing: false,
        modelName: "fringe"
      }),
      (m: Tables.FringeRow) => m.id
    );
  });

  const columns = useMemo(
    () =>
      tabling.columns.normalizeColumns(Columns, {
        identifier: {
          headerName: props.identifierFieldHeader
        },
        description: { headerName: `${props.categoryName} Description` },
        unit: { processCellFromClipboard: processUnitCellFromClipboard },
        fringes: {
          cellEditor: "FringesEditor",
          cellEditorParams: { onAddFringes: props.onAddFringes },
          headerComponentParams: { onEdit: () => props.onEditFringes() },
          processCellFromClipboard: processFringesCellFromClipboard,
          processCellForClipboard: processFringesCellForClipboard
        }
      }),
    [props.identifierFieldHeader, hooks.useDeepEqualMemo(props.subAccountUnits)]
  );

  return (
    <AuthenticatedBudgetTable<R, M>
      {...props}
      excludeColumns={["actual", "contact", "variance", "attachments"]}
      columns={columns}
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
              props.onGroupRows(modelRows);
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
            /* If rows are explicitly selected for the Markup, we want to
							 include them as the default children for the Markup in the modal,
							 which will default the unit in the modal to PERCENT. */
            if (selectedRows.length !== 0) {
              props.onMarkupRows(selectedRows);
            } else {
              const rows: Table.ModelRow<R>[] = filter(props.table.current.getRows(), (r: Table.BodyRow<R>) =>
                tabling.typeguards.isModelRow(r)
              ) as Table.ModelRow<R>[];
              if (rows.length !== 0) {
                props.onMarkupRows();
              }
            }
          }
        },
        ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
        framework.actions.ToggleColumnAction<R, M>(props.table.current, params),
        framework.actions.ExportCSVAction<R, M>(props.table.current, params, props.exportFileName)
      ]}
    />
  );
};

export default React.memo(SubAccountsTable<AuthenticatedTemplateProps>(AuthenticatedTemplateSubAccountsTable));

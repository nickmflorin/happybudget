import React from "react";
import { isNil, filter } from "lodash";

import {
  AuthenticatedTable,
  AuthenticatedTableProps,
  AuthenticatedTableDataGridProps
} from "components/tabling/generic";

import { tabling } from "lib";

import { AuthenticatedBudgetDataGrid } from "../grids";
import { Framework } from "../framework";

export type AuthenticatedBudgetTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = Omit<AuthenticatedTableProps<R, M>, "children"> & {
  readonly onBack?: () => void;
  // Markup is currently not applicable for Templates.
  readonly onEditMarkup?: (row: Table.MarkupRow<R>) => void;
  readonly onEditGroup?: (row: Table.GroupRow<R>) => void;
  readonly onRowExpand?: (row: Table.ModelRow<R>) => void;
};

/* eslint-disable indent */
const AuthenticatedBudgetTable = <R extends Tables.BudgetRowData, M extends Model.RowHttpModel = Model.RowHttpModel>({
  onEditMarkup,
  onEditGroup,
  onRowExpand,
  ...props
}: AuthenticatedBudgetTableProps<R, M>): JSX.Element => {
  return (
    <AuthenticatedTable<R, M>
      {...props}
      generateNewRowData={(rows: Table.BodyRow<R>[]) => {
        const dataRows = filter(rows, (r: Table.BodyRow<R>) => tabling.typeguards.isDataRow(r)) as Table.DataRow<R>[];
        if (dataRows.length !== 0) {
          const lastRow: Table.DataRow<R> = dataRows[dataRows.length - 1];
          if (!isNil(lastRow.data.identifier) && !isNaN(parseInt(lastRow.data.identifier))) {
            return { identifier: String(parseInt(lastRow.data.identifier) + 1) } as Partial<R>;
          }
        }
        return {};
      }}
      editColumnConfig={[
        {
          conditional: (r: Table.NonPlaceholderBodyRow<R>) => tabling.typeguards.isMarkupRow(r),
          action: (r: Table.MarkupRow<R>) => onEditMarkup?.(r),
          behavior: "edit"
        },
        {
          conditional: (r: Table.NonPlaceholderBodyRow<R>) => tabling.typeguards.isGroupRow(r),
          action: (r: Table.GroupRow<R>) => onEditGroup?.(r),
          behavior: "edit"
        },
        {
          conditional: (r: Table.NonPlaceholderBodyRow<R>) => tabling.typeguards.isModelRow(r),
          action: (r: Table.ModelRow<R>) => onRowExpand?.(r),
          behavior: "expand"
        }
      ]}
      framework={tabling.aggrid.combineFrameworks(Framework, props.framework)}
    >
      {(params: AuthenticatedTableDataGridProps<R, M>) => (
        <AuthenticatedBudgetDataGrid<R, M> {...params} onBack={props.onBack} />
      )}
    </AuthenticatedTable>
  );
};

export default React.memo(AuthenticatedBudgetTable) as typeof AuthenticatedBudgetTable;

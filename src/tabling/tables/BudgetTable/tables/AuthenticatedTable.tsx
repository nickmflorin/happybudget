import React from "react";

import { AuthenticatedTable, AuthenticatedTableProps, AuthenticatedTableDataGridProps } from "tabling/generic";

import { tabling } from "lib";

import { AuthenticatedBudgetDataGrid } from "../grids";
import { Framework } from "../framework";

export type AuthenticatedBudgetTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = Omit<AuthenticatedTableProps<R, M>, "children"> & {
  readonly onBack?: () => void;
  readonly onLeft?: () => void;
  readonly onRight?: () => void;
  // Markup is currently not applicable for Templates.
  readonly onEditMarkup?: (row: Table.MarkupRow<R>) => void;
  readonly onEditGroup?: (row: Table.GroupRow<R>) => void;
  readonly onRowExpand?: (row: Table.ModelRow<R>) => void;
};

const AuthenticatedBudgetTable = <R extends Tables.BudgetRowData, M extends Model.RowHttpModel = Model.RowHttpModel>({
  onEditMarkup,
  onEditGroup,
  onRowExpand,
  ...props
}: AuthenticatedBudgetTableProps<R, M>): JSX.Element => {
  return (
    <AuthenticatedTable<R, M>
      {...props}
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

import React from "react";
import { tabling } from "lib";
import { AuthenticatedTable, AuthenticatedTableProps } from "tabling/generic";
import { Framework } from "./framework";

export type AuthenticatedBudgetTableProps<
  R extends Tables.BudgetRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.BudgetTableStore<R> = Redux.BudgetTableStore<R>
> = AuthenticatedTableProps<R, M, S> & {
  readonly onEditMarkup?: (row: Table.MarkupRow<R>) => void;
  readonly onEditGroup?: (row: Table.GroupRow<R>) => void;
  readonly onRowExpand?: (row: Table.ModelRow<R>) => void;
};

const AuthenticatedBudgetTable = <
  R extends Tables.BudgetRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.BudgetTableStore<R> = Redux.BudgetTableStore<R>
>({
  onEditMarkup,
  onEditGroup,
  onRowExpand,
  ...props
}: AuthenticatedBudgetTableProps<R, M, S>): JSX.Element => (
  <AuthenticatedTable
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
  />
);

export default React.memo(AuthenticatedBudgetTable) as typeof AuthenticatedBudgetTable;

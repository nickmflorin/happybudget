import React from "react";
import { tabling } from "lib";
import { PublicTable, PublicTableProps } from "tabling/generic";
import { Framework } from "./framework";

export type PublicBudgetTableProps<
  R extends Tables.BudgetRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.BudgetTableStore<R> = Redux.BudgetTableStore<R>
> = PublicTableProps<R, M, S> & {
  readonly onRowExpand?: (row: Table.ModelRow<R>) => void;
};

const PublicBudgetTable = <
  R extends Tables.BudgetRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.BudgetTableStore<R> = Redux.BudgetTableStore<R>
>({
  onRowExpand,
  ...props
}: PublicBudgetTableProps<R, M, S>): JSX.Element => (
  <PublicTable<R, M, S>
    {...props}
    editColumnConfig={[
      {
        conditional: (r: Table.NonPlaceholderBodyRow<R>) => tabling.typeguards.isModelRow(r),
        action: (r: Table.ModelRow<R>) => onRowExpand?.(r),
        behavior: "expand"
      }
    ]}
    framework={tabling.aggrid.combineFrameworks(Framework, props.framework)}
  />
);

export default React.memo(PublicBudgetTable) as typeof PublicBudgetTable;

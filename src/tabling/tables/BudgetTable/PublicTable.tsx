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
    editColumnConfig={
      [
        {
          typeguard: tabling.typeguards.isModelRow,
          action: (r: Table.ModelRow<R>) => onRowExpand?.(r),
          behavior: "expand",
          conditional: (r: Table.ModelRow<R>) => r.children.length !== 0
        }
      ] as [Table.EditColumnRowConfig<R, Table.ModelRow<R>>]
    }
    framework={tabling.aggrid.combineFrameworks(Framework, props.framework)}
  />
);

export default React.memo(PublicBudgetTable) as typeof PublicBudgetTable;

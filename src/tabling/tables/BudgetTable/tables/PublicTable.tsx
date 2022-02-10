import React from "react";
import { PublicTable, PublicTableProps, PublicTableDataGridProps } from "tabling/generic";

import { PublicBudgetDataGrid } from "../grids";

export type PublicBudgetTableProps<
  R extends Tables.BudgetRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.BudgetTableStore<R> = Redux.BudgetTableStore<R>
> = PublicTableProps<R, M, S> & {
  readonly onBack?: () => void;
  readonly onLeft?: () => void;
  readonly onRight?: () => void;
};

const PublicBudgetTable = <
  R extends Tables.BudgetRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.BudgetTableStore<R> = Redux.BudgetTableStore<R>
>(
  props: PublicBudgetTableProps<R, M, S>
): JSX.Element => {
  return (
    <PublicTable<R, M, S> {...props}>
      {(params: PublicTableDataGridProps<R, M>) => <PublicBudgetDataGrid<R, M> {...params} onBack={props.onBack} />}
    </PublicTable>
  );
};

export default React.memo(PublicBudgetTable) as typeof PublicBudgetTable;

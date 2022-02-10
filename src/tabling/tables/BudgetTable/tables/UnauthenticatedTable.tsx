import React from "react";
import { UnauthenticatedTable, UnauthenticatedTableProps, UnauthenticatedTableDataGridProps } from "tabling/generic";

import { UnauthenticatedBudgetDataGrid } from "../grids";

export type UnauthenticatedBudgetTableProps<
  R extends Tables.BudgetRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.BudgetTableStore<R> = Redux.BudgetTableStore<R>
> = UnauthenticatedTableProps<R, M, S> & {
  readonly onBack?: () => void;
  readonly onLeft?: () => void;
  readonly onRight?: () => void;
};

const UnauthenticatedBudgetTable = <
  R extends Tables.BudgetRowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.BudgetTableStore<R> = Redux.BudgetTableStore<R>
>(
  props: UnauthenticatedBudgetTableProps<R, M, S>
): JSX.Element => {
  return (
    <UnauthenticatedTable<R, M, S> {...props}>
      {(params: UnauthenticatedTableDataGridProps<R, M>) => (
        <UnauthenticatedBudgetDataGrid<R, M> {...params} onBack={props.onBack} />
      )}
    </UnauthenticatedTable>
  );
};

export default React.memo(UnauthenticatedBudgetTable) as typeof UnauthenticatedBudgetTable;

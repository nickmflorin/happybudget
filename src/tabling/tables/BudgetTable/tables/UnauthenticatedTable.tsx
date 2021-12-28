import React from "react";
import { UnauthenticatedTable, UnauthenticatedTableProps, UnauthenticatedTableDataGridProps } from "tabling/generic";

import { UnauthenticatedBudgetDataGrid } from "../grids";

export type UnauthenticatedBudgetTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = Omit<UnauthenticatedTableProps<R, M>, "children"> & {
  readonly onBack?: () => void;
  readonly onLeft?: () => void;
  readonly onRight?: () => void;
};

const UnauthenticatedBudgetTable = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  props: UnauthenticatedBudgetTableProps<R, M>
): JSX.Element => {
  return (
    <UnauthenticatedTable<R, M> {...props}>
      {(params: UnauthenticatedTableDataGridProps<R, M>) => (
        <UnauthenticatedBudgetDataGrid<R, M> {...params} onBack={props.onBack} />
      )}
    </UnauthenticatedTable>
  );
};

export default React.memo(UnauthenticatedBudgetTable) as typeof UnauthenticatedBudgetTable;

import {
  UnauthenticatedTable,
  UnauthenticatedTableProps,
  UnauthenticatedTableDataGridProps
} from "components/tabling/generic";

import { UnauthenticatedBudgetDataGrid } from "../grids";

export type UnauthenticatedBudgetTableProps<R extends Table.RowData, M extends Model.Model = Model.Model> = Omit<
  UnauthenticatedTableProps<R, M, Model.BudgetGroup>,
  "children"
> & {
  readonly onBack?: () => void;
};

/* eslint-disable indent */
const UnauthenticatedBudgetTable = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  props: UnauthenticatedBudgetTableProps<R, M>
): JSX.Element => {
  return (
    <UnauthenticatedTable<R, M, Model.BudgetGroup> {...props}>
      {(params: UnauthenticatedTableDataGridProps<R, M, Model.BudgetGroup>) => (
        <UnauthenticatedBudgetDataGrid<R, M> {...params} />
      )}
    </UnauthenticatedTable>
  );
};

export default UnauthenticatedBudgetTable;

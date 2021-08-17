import {
  ReadOnlyGrid,
  ReadOnlyGridProps,
  DataGrid,
  DataGridProps,
  ReadOnlyDataGrid,
  ReadOnlyDataGridProps
} from "components/tabling/generic";

import BudgetDataGrid, { BudgetDataGridProps } from "./makeDataGrid";

export type ReadOnlyBudgetDataGridProps<R extends BudgetTable.Row = any, M extends Model.Model = any> = DataGridProps<
  R,
  M
> &
  ReadOnlyDataGridProps<R, M> &
  Omit<ReadOnlyGridProps<R, M>, "id"> &
  BudgetDataGridProps<R, M>;

const DG = DataGrid<ReadOnlyBudgetDataGridProps>({
  refreshRowExpandColumnOnCellHover: (row: BudgetTable.Row) => row.meta.isGroupRow !== true
})(ReadOnlyGrid);
const DGW = ReadOnlyDataGrid<ReadOnlyBudgetDataGridProps>({
  includeRowInNavigation: (row: BudgetTable.Row) => row.meta.isGroupRow !== true
})(DG);
const BudgetGrid = BudgetDataGrid<ReadOnlyBudgetDataGridProps>(DGW);

export default BudgetGrid;

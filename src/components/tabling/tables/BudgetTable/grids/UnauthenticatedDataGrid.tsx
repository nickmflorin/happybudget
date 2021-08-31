import {
  UnauthenticatedGrid,
  DataGrid,
  DataGridProps,
  unauthenticateDataGrid,
  UnauthenticatedDataGridProps
} from "components/tabling/generic";

import BudgetDataGrid, { BudgetDataGridProps } from "./makeDataGrid";

export type UnauthenticatedBudgetDataGridProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model
> = UnauthenticatedDataGridProps<R, M, Model.BudgetGroup> & BudgetDataGridProps<R, M>;

const DG = DataGrid<any, any, any, UnauthenticatedBudgetDataGridProps<any>>()(UnauthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.Model = Model.Model>(
    props: DataGridProps<R, M, Model.BudgetGroup>
  ): JSX.Element;
};

const DGW = unauthenticateDataGrid<any, any, UnauthenticatedBudgetDataGridProps<any>>()(DG);

export default BudgetDataGrid<any, any, UnauthenticatedBudgetDataGridProps<any>>(DGW) as {
  <R extends Table.RowData, M extends Model.Model = Model.Model>(
    props: UnauthenticatedBudgetDataGridProps<R, M>
  ): JSX.Element;
};

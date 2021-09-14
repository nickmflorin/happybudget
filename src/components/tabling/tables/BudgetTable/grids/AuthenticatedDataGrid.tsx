import {
  AuthenticatedGrid,
  DataGrid,
  DataGridProps,
  authenticateDataGrid,
  AuthenticatedDataGridProps
} from "components/tabling/generic";

import BudgetDataGrid, { BudgetDataGridProps } from "./makeDataGrid";

export type AuthenticatedBudgetDataGridProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model
> = AuthenticatedDataGridProps<R, M, Model.BudgetGroup> & BudgetDataGridProps<R, M>;

const DG = DataGrid<any, any, Model.BudgetGroup, AuthenticatedBudgetDataGridProps<any, any>>()(AuthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.Model = Model.Model>(
    props: DataGridProps<R, M, Model.BudgetGroup>
  ): JSX.Element;
};

const DGW = authenticateDataGrid<any, any, Model.BudgetGroup, AuthenticatedBudgetDataGridProps<any, any>>()(DG);

export default BudgetDataGrid<any, any, AuthenticatedBudgetDataGridProps<any, any>>(DGW) as {
  <R extends Table.RowData, M extends Model.Model = Model.Model>(
    props: AuthenticatedBudgetDataGridProps<R, M>
  ): JSX.Element;
};

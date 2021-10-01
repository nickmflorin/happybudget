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
  M extends Model.HttpModel = Model.HttpModel
> = AuthenticatedDataGridProps<R, M> & BudgetDataGridProps<R>;

const DG = DataGrid<any, any, AuthenticatedBudgetDataGridProps<any, any>>()(AuthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(props: DataGridProps<R, M>): JSX.Element;
};

const DGW = authenticateDataGrid<any, any, AuthenticatedBudgetDataGridProps<any, any>>()(DG);

export default BudgetDataGrid<any, AuthenticatedBudgetDataGridProps<any>>(DGW) as {
  <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
    props: AuthenticatedBudgetDataGridProps<R, M>
  ): JSX.Element;
};

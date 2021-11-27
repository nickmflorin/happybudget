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
  M extends Model.RowHttpModel = Model.RowHttpModel
> = UnauthenticatedDataGridProps<R, M> & BudgetDataGridProps<R>;

const DG = DataGrid<any, any, UnauthenticatedBudgetDataGridProps<any, any>>()(UnauthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(props: DataGridProps<R, M>): JSX.Element;
};

const DGW = unauthenticateDataGrid<any, any, UnauthenticatedBudgetDataGridProps<any, any>>()(DG);

export default BudgetDataGrid<any, UnauthenticatedBudgetDataGridProps<any>>(DGW) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
    props: UnauthenticatedBudgetDataGridProps<R, M>
  ): JSX.Element;
};

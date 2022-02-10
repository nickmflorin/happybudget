import { PublicGrid, DataGrid, DataGridProps, publicizeDataGrid, PublicDataGridProps } from "tabling/generic";

import BudgetDataGrid, { BudgetDataGridProps } from "./makeDataGrid";

export type PublicBudgetDataGridProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = PublicDataGridProps<R, M> & BudgetDataGridProps<R>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const DG = DataGrid<any, any, PublicBudgetDataGridProps<any, any>>()(PublicGrid) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(props: DataGridProps<R, M>): JSX.Element;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const DGW = publicizeDataGrid<any, any, PublicBudgetDataGridProps<any, any>>()(DG);

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default BudgetDataGrid<any, PublicBudgetDataGridProps<any>>(DGW) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
    props: PublicBudgetDataGridProps<R, M>
  ): JSX.Element;
};

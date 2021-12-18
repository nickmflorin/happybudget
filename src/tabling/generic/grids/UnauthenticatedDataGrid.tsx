import { DataGrid, unauthenticateDataGrid, UnauthenticateDataGridProps, DataGridProps } from "../hocs";
import UnauthenticatedGrid, { UnauthenticatedGridProps } from "./UnauthenticatedGrid";

export type UnauthenticatedDataGridProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = DataGridProps<R, M> & UnauthenticateDataGridProps<R, M> & Omit<UnauthenticatedGridProps<R, M>, "id">;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const DG = DataGrid<any, any, UnauthenticatedDataGridProps<any>>()(UnauthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(props: DataGridProps<R, M>): JSX.Element;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default unauthenticateDataGrid<any, any, UnauthenticatedDataGridProps<any>>()(DG) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
    props: UnauthenticatedDataGridProps<R, M>
  ): JSX.Element;
};

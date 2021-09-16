import { DataGrid, unauthenticateDataGrid, UnauthenticateDataGridProps, DataGridProps } from "../hocs";
import UnauthenticatedGrid, { UnauthenticatedGridProps } from "./UnauthenticatedGrid";

export type UnauthenticatedDataGridProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel
> = DataGridProps<R, M> & UnauthenticateDataGridProps<R, M> & Omit<UnauthenticatedGridProps<R, M>, "id">;

const DG = DataGrid<any, any, UnauthenticatedDataGridProps<any>>()(UnauthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(props: DataGridProps<R, M>): JSX.Element;
};

export default unauthenticateDataGrid<any, any, UnauthenticatedDataGridProps<any>>()(DG) as {
  <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
    props: UnauthenticatedDataGridProps<R, M>
  ): JSX.Element;
};

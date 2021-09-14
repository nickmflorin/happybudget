import { DataGrid, unauthenticateDataGrid, UnauthenticateDataGridProps, DataGridProps } from "../hocs";
import UnauthenticatedGrid, { UnauthenticatedGridProps } from "./UnauthenticatedGrid";

export type UnauthenticatedDataGridProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
> = DataGridProps<R, M, G> & UnauthenticateDataGridProps<R, M, G> & Omit<UnauthenticatedGridProps<R, M, G>, "id">;

const DG = DataGrid<any, any, any, UnauthenticatedDataGridProps<any>>()(UnauthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group>(
    props: DataGridProps<R, M, G>
  ): JSX.Element;
};

export default unauthenticateDataGrid<any, any, any, UnauthenticatedDataGridProps<any>>()(DG) as {
  <R extends Table.RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group>(
    props: UnauthenticatedDataGridProps<R, M, G>
  ): JSX.Element;
};

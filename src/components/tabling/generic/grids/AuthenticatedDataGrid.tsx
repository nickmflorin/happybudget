import { DataGrid, authenticateDataGrid, AuthenticateDataGridProps, DataGridProps } from "../hocs";
import AuthenticatedGrid, { AuthenticatedGridProps } from "./AuthenticatedGrid";

export type AuthenticatedDataGridProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
> = DataGridProps<R, M, G> & AuthenticateDataGridProps<R, M, G> & Omit<AuthenticatedGridProps<R, M, G>, "id">;

const DG = DataGrid<any, any, any, AuthenticatedDataGridProps<any>>()(AuthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group>(
    props: DataGridProps<R, M, G>
  ): JSX.Element;
};

export default authenticateDataGrid<any, any, any, AuthenticatedDataGridProps<any>>()(DG) as {
  <R extends Table.RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group>(
    props: AuthenticatedDataGridProps<R, M, G>
  ): JSX.Element;
};

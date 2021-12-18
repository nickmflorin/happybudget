import { DataGrid, authenticateDataGrid, AuthenticateDataGridProps, DataGridProps } from "../hocs";
import AuthenticatedGrid, { AuthenticatedGridProps } from "./AuthenticatedGrid";

export type AuthenticatedDataGridProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = DataGridProps<R, M> & AuthenticateDataGridProps<R, M> & Omit<AuthenticatedGridProps<R, M>, "id">;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const DG = DataGrid<any, any, AuthenticatedDataGridProps<any>>()(AuthenticatedGrid) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(props: DataGridProps<R, M>): JSX.Element;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default authenticateDataGrid<any, any, AuthenticatedDataGridProps<any>>()(DG) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
    props: AuthenticatedDataGridProps<R, M>
  ): JSX.Element;
};

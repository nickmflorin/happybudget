import { DataGrid, publicizeDataGrid, PublicizeDataGridProps, DataGridProps } from "../hocs";
import PublicGrid, { PublicGridProps } from "./PublicGrid";

export type PublicDataGridProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = DataGridProps<R, M> & PublicizeDataGridProps<R, M> & Omit<PublicGridProps<R, M>, "id">;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const DG = DataGrid<any, any, PublicDataGridProps<any>>()(PublicGrid) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(props: DataGridProps<R, M>): JSX.Element;
};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export default publicizeDataGrid<any, any, PublicDataGridProps<any>>()(DG) as {
  <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
    props: PublicDataGridProps<R, M>
  ): JSX.Element;
};

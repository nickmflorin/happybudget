/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace TableUi {
  interface DataGridConfig<R extends Table.Row> {
    readonly refreshRowExpandColumnOnCellHover?: (row: R) => boolean;
  }

  type ReadWriteDataGridConfig<R extends Table.Row> = DataGridConfig<R> & {
    readonly rowCanDelete?: (row: R) => boolean;
    readonly includeRowInNavigation?: (row: R) => boolean;
  };

  type ReadOnlyDataGridConfig<R extends Table.Row> = {
    readonly includeRowInNavigation?: (row: R) => boolean;
  };

  type FooterGridConfig<R extends Table.Row, M extends Model.Model> = {
    readonly id: "page" | "footer";
    readonly rowId: string;
    readonly rowClass: Table.RowClassName;
    readonly className: Table.GeneralClassName;
    readonly rowHeight?: number;
    readonly getFooterColumn: (column: Table.Column<R, M>) => Table.FooterColumn<R, M> | null;
  };

  type DataGridRenderParams<R extends Table.Row, M extends Model.Model> = {
    readonly apis: Table.GridApis | null;
    readonly hiddenColumns: Table.Field<R, M>[];
    readonly columns: Table.Column<R, M>[];
    readonly gridOptions: Table.GridOptions;
    readonly hasExpandColumn: boolean;
    readonly onGridReady: (event: Table.GridReadyEvent) => void;
    readonly onFirstDataRendered: (e: Table.FirstDataRenderedEvent) => void;
  };

  type ReadOnlyDataGridRenderParams<R extends Table.Row, M extends Model.Model> = Table.DataGridRenderParams<
    R,
    M
  > & {};

  type ReadWriteDataGridRenderParams<R extends Table.Row, M extends Model.Model> = DataGridRenderParams<R, M> & {
    readonly onRowSelectionChanged: (rows: R[]) => void;
    readonly onChangeEvent: (event: Table.ChangeEvent<R, M>) => void;
    readonly rowHasCheckboxSelection: ((r: R) => boolean) | undefined;
  };
}
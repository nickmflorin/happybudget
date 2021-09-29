/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace TableUi {
  interface DataGridConfig<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> {
    readonly refreshRowExpandColumnOnCellHover?: (row: Table.Row<R, M>) => boolean;
  }

  type AuthenticatedDataGridConfig<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> = DataGridConfig<R, M> & {
    readonly rowCanDelete?: (row: Table.EditableRow<R, M>) => boolean;
    readonly includeRowInNavigation?: (row: Table.EditableRow<R, M>) => boolean;
  };

  type UnauthenticatedDataGridConfig<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> = {
    readonly includeRowInNavigation?: (row: Table.EditableRow<R, M>) => boolean;
  };

  type FooterGridConfig<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> = {
    readonly id: "page" | "footer";
    readonly rowId: string;
    readonly rowClass: Table.RowClassName;
    readonly className: Table.GeneralClassName;
    readonly rowHeight?: number;
    readonly getFooterColumn: (column: Table.Column<R, M>) => Table.FooterColumn<R, M> | null;
  }
}
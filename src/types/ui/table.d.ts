/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace TableUi {
  interface DataGridConfig<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> {
    readonly refreshRowExpandColumnOnCellHover?: (row: Table.Row<R>) => boolean;
  }

  type AuthenticatedDataGridConfig<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> = DataGridConfig<R, M> & {
    readonly rowCanDelete?: (row: Table.EditableRow<R>) => boolean;
    readonly includeRowInNavigation?: (row: Table.EditableRow<R>) => boolean;
  };

  type UnauthenticatedDataGridConfig<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> = {
    readonly includeRowInNavigation?: (row: Table.EditableRow<R>) => boolean;
  };

  type FooterGridConfig<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> = {
    readonly id: "page" | "footer";
    readonly rowClass: Table.RowClassName;
    readonly className: Table.GeneralClassName;
    readonly rowHeight?: number;
    readonly getFooterColumn: (column: Table.Column<R, M>) => Table.FooterColumn<R, M> | null;
  }
}
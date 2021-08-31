/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace TableUi {
  interface DataGridConfig<R extends Table.Row, M extends Model.Model = Model.Model> {
    readonly refreshRowExpandColumnOnCellHover?: (row: Table.Row<R, M>) => boolean;
  }

  type AuthenticatedDataGridConfig<R extends Table.Row, M extends Model.Model = Model.Model> = DataGridConfig<R, M> & {
    readonly rowCanDelete?: (row: Table.DataRow<R, M>) => boolean;
    readonly includeRowInNavigation?: (row: Table.DataRow<R, M>) => boolean;
  };

  type UnauthenticatedDataGridConfig<R extends Table.Row, M extends Model.Model = Model.Model> = {
    readonly includeRowInNavigation?: (row: Table.DataRow<R, M>) => boolean;
  };

  type FooterGridConfig<R extends Table.Row, M extends Model.Model = Model.Model> = {
    readonly id: "page" | "footer";
    readonly rowId: string;
    readonly rowClass: Table.RowClassName;
    readonly className: Table.GeneralClassName;
    readonly rowHeight?: number;
    readonly getFooterColumn: (column: Table.Column<R, M>) => Table.FooterColumn<R, M> | null;
  }
}
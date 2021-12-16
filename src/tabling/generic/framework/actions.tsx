import { util } from "lib";
import { ExportCSVDropdown, ToggleColumnsDropdown } from "components/dropdowns";

export const ExportPdfAction = (onExport: () => void): Table.MenuActionObj => ({
  icon: "print",
  label: "Export PDF",
  onClick: () => onExport()
});

/* eslint-disable indent */
export const ExportCSVAction = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  table: Table.TableInstance<R, M>,
  params: Table.MenuActionParams<R, M>,
  exportFileName: string
): Table.MenuActionObj => ({
  /* eslint-disable indent */
  label: "Export CSV",
  icon: "file-csv",
  wrapInDropdown: (children: React.ReactChild | React.ReactChild[]) => {
    return (
      <ExportCSVDropdown<R, M>
        columns={params.columns}
        hiddenColumns={params.hiddenColumns}
        onDownload={(ids: string[]) => {
          if (ids.length !== 0) {
            const csvData = table.getCSVData(ids);
            util.files.downloadAsCsvFile(exportFileName, csvData);
          }
        }}
      >
        {children}
      </ExportCSVDropdown>
    );
  }
});

export const ToggleColumnAction = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  table: Table.TableInstance<R, M>,
  params: Table.MenuActionParams<R, M>
): Table.MenuActionObj => ({
  /* eslint-disable indent */
  label: "Columns",
  icon: "line-columns",
  wrapInDropdown: (children: React.ReactChild | React.ReactChild[]) => {
    return (
      <ToggleColumnsDropdown
        hiddenColumns={params.hiddenColumns}
        columns={params.columns}
        onChange={(field: string, visible: boolean) => {
          table.changeColumnVisibility({
            field,
            visible
          });
        }}
      >
        {children}
      </ToggleColumnsDropdown>
    );
  }
});
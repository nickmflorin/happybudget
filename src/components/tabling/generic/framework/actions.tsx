import { ReactNode } from "react";
import { filter, map, includes } from "lodash";
import { faLineColumns, faFileCsv } from "@fortawesome/pro-regular-svg-icons";

import { util } from "lib";
import { FieldsDropdown } from "components/dropdowns";

export const ExportCSVAction = <R extends Table.Row, M extends Model.Model>(
  table: Table.Table<R, M>,
  params: Table.MenuActionParams<R, M>,
  exportFileName: string
): Table.MenuAction => ({
  /* eslint-disable indent */
  text: "Export CSV",
  icon: faFileCsv,
  wrapInDropdown: (children: ReactNode) => {
    const exportableColumns = filter(params.columns, (col: Table.Column<R, M>) => col.canBeExported !== false);
    return (
      <FieldsDropdown
        fields={map(exportableColumns, (col: Table.Column<R, M>) => ({
          id: col.field as string,
          label: col.headerName || "",
          defaultChecked: !includes(params.hiddenColumns, col.field as string)
        }))}
        buttons={[
          {
            onClick: (checks: FieldCheck[]) => {
              const fields = map(
                filter(checks, (field: FieldCheck) => field.checked === true),
                (field: FieldCheck) => field.id
              );
              if (fields.length !== 0) {
                const csvData = table.getCSVData(fields);
                util.files.downloadAsCsvFile(exportFileName, csvData);
              }
            },
            text: "Download",
            className: "btn btn--primary"
          }
        ]}
      >
        {children}
      </FieldsDropdown>
    );
  }
});

export const ToggleColumnAction = <R extends Table.Row, M extends Model.Model>(
  table: Table.Table<R, M>,
  params: Table.MenuActionParams<R, M>
): Table.MenuAction => ({
  /* eslint-disable indent */
  text: "Columns",
  icon: faLineColumns,
  wrapInDropdown: (children: ReactNode) => {
    const hideableColumns = filter(params.columns, (col: Table.Column<R, M>) => col.canBeHidden !== false);
    return (
      <FieldsDropdown
        selected={map(
          filter(hideableColumns, (col: Table.Column<R, M>) => !includes(params.hiddenColumns, col.field)),
          (col: Table.Column<R, M>) => col.field as string
        )}
        fields={map(hideableColumns, (col: Table.Column<R, M>) => ({
          id: col.field as string,
          label: col.headerName || "",
          defaultChecked: includes(params.hiddenColumns, col.field as string)
        }))}
        onChange={(change: FieldCheck) => table.changeColumnVisibility({ field: change.id, visible: change.checked })}
      >
        {children}
      </FieldsDropdown>
    );
  }
});

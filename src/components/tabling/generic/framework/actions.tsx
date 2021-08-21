import { filter, map, includes } from "lodash";

import { util } from "lib";
import { Dropdown } from "components";

export const ExportCSVAction = <R extends Table.Row, M extends Model.Model>(
  table: Table.Table<R, M>,
  params: Table.MenuActionParams<R, M>,
  exportFileName: string
): Table.MenuAction => ({
  /* eslint-disable indent */
  text: "Export CSV",
  icon: "file-csv",
  wrapInDropdown: (children: React.ReactChild | React.ReactChild[]) => {
    const exportableColumns = filter(params.columns, (col: Table.Column<R, M>) => col.canBeExported !== false);
    return (
      <Dropdown
        menuMode={"multiple"}
        menuCheckbox={true}
        menuDefaultSelected={params.hiddenColumns as MenuItemId[]}
        menuItems={map(exportableColumns, (col: Table.Column<R, M>) => ({
          id: col.field as string,
          label: col.headerName || ""
        }))}
        menuButtons={[
          {
            onClick: (state: IMenuState) => {
              if (state.selected.length !== 0) {
                const csvData = table.getCSVData(state.selected as string[]);
                util.files.downloadAsCsvFile(exportFileName, csvData);
              }
            },
            text: "Download",
            className: "btn btn--primary"
          }
        ]}
      >
        {children}
      </Dropdown>
    );
  }
});

export const ToggleColumnAction = <R extends Table.Row, M extends Model.Model>(
  table: Table.Table<R, M>,
  params: Table.MenuActionParams<R, M>
): Table.MenuAction => ({
  /* eslint-disable indent */
  text: "Columns",
  icon: "line-columns",
  wrapInDropdown: (children: React.ReactChild | React.ReactChild[]) => {
    const hideableColumns = filter(params.columns, (col: Table.Column<R, M>) => col.canBeHidden !== false);
    return (
      <Dropdown
        menuMode={"multiple"}
        menuCheckbox={true}
        menuSelected={map(
          filter(hideableColumns, (col: Table.Column<R, M>) => !includes(params.hiddenColumns, col.field)),
          (col: Table.Column<R, M>) => col.field as string
        )}
        menuItems={map(hideableColumns, (col: Table.Column<R, M>) => ({
          id: col.field as string,
          label: col.headerName || ""
        }))}
        onChange={(p: IMenuChangeParams) =>
          table.changeColumnVisibility({ field: p.change.id as Table.Field<R, M>, visible: p.change.selected })
        }
      >
        {children}
      </Dropdown>
    );
  }
});

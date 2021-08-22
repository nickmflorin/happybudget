import { map, filter } from "lodash";
import { util } from "lib";
import { ExportCSVDropdown, ToggleColumnsDropdown } from "components/dropdowns";

export const ExportCSVAction = <R extends Table.Row, M extends Model.Model>(
  table: Table.Table<R, M>,
  params: Table.MenuActionParams<R, M>,
  exportFileName: string
): Table.MenuAction => ({
  /* eslint-disable indent */
  text: "Export CSV",
  icon: "file-csv",
  wrapInDropdown: (children: React.ReactChild | React.ReactChild[]) => {
    return (
      <ExportCSVDropdown<R, M>
        columns={params.columns}
        hiddenColumns={params.hiddenColumns}
        onDownload={(state: IMenuItemState<MenuItemModel>[]) => {
          if (state.length !== 0) {
            const selectedStates = filter(
              state,
              (s: IMenuItemState<MenuItemModel>) => s.selected === true
            ) as IMenuItemState<MenuItemModel>[];
            const selectedIds = map(selectedStates, (s: IMenuItemState<MenuItemModel>) => String(s.model.id));
            const csvData = table.getCSVData(selectedIds);
            util.files.downloadAsCsvFile(exportFileName, csvData);
          }
        }}
      >
        {children}
      </ExportCSVDropdown>
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
    return (
      <ToggleColumnsDropdown
        hiddenColumns={params.hiddenColumns}
        columns={params.columns}
        onChange={(p: MenuChangeEvent<MenuItemModel>) =>
          table.changeColumnVisibility({ field: p.model.id as Table.Field<R, M>, visible: p.selected })
        }
      >
        {children}
      </ToggleColumnsDropdown>
    );
  }
});

import { useEffect, useMemo, useState } from "react";
import { filter, map, includes, isNil } from "lodash";

import Dropdown from "./Dropdown";

export interface ExportCSVDropdownProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> {
  readonly children: React.ReactChild | React.ReactChild[];
  readonly columns: Table.Column<R, M>[];
  readonly onDownload: (state: IMenuItemState<MenuItemModel>[]) => void;
  readonly hiddenColumns?: (keyof R | string)[];
}

const colField = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  col: Table.Column<R, M>
): keyof R | string | undefined => (col.field !== undefined ? col.field : col.colId);

/* eslint-disable indent */
const ExportCSVDropdown = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  props: ExportCSVDropdownProps<R, M>
): JSX.Element => {
  const [selected, setSelected] = useState<(keyof R)[]>([]);

  const exportableColumns = useMemo<Table.Column<R, M>[]>(
    () =>
      filter(
        props.columns,
        (col: Table.Column<R, M>) =>
          col.canBeExported !== false && col.tableColumnType !== "fake" && !isNil(colField(col))
      ),
    [props.columns]
  );

  useEffect(() => {
    setSelected(
      filter(
        map(
          filter(exportableColumns, (col: Table.Column<R, M>) => !includes(props.hiddenColumns, col.field)),
          (col: Table.Column<R, M>) => col.field
        ),
        (field: keyof R | undefined) => !isNil(field)
      ) as (keyof R)[]
    );
  }, [props.columns, props.hiddenColumns]);

  return (
    <Dropdown
      menuMode={"multiple"}
      menuCheckbox={true}
      includeSearch={true}
      keepDropdownOpenOnClick={true}
      searchIndices={["label"]}
      onChange={(e: MenuChangeEvent<MenuItemModel>) => {
        const selectedStates = filter(
          e.state,
          (s: IMenuItemState<MenuItemModel>) => s.selected === true
        ) as IMenuItemState<MenuItemModel>[];
        const selectedIds = map(selectedStates, (state: IMenuItemState<MenuItemModel>) => String(state.model.id));
        setSelected(selectedIds as (keyof R)[]);
      }}
      menuSelected={selected as string[]}
      menuItems={map(exportableColumns, (col: Table.Column<R, M>) => ({
        id: col.field as string,
        label: col.headerName || ""
      }))}
      menuButtons={[
        {
          onClick: (e: MenuButtonClickEvent<MenuItemModel>) => props.onDownload(e.state),
          label: "Download",
          className: "btn btn--primary"
        }
      ]}
    >
      {props.children}
    </Dropdown>
  );
};

export default ExportCSVDropdown;

import React, { useMemo } from "react";
import { filter, map, isNil } from "lodash";

import DropdownMenu, { DropdownMenuProps } from "./DropdownMenu";

type OmitDropdownProps = "mode" | "checkbox" | "selected" | "models" | "onChange";

type ColumnMenuModel = {
  readonly id: string;
  readonly label: string;
};

export interface ToggleColumnsDropdownProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>
  extends Omit<DropdownMenuProps<MenuItemSelectedState, ColumnMenuModel>, OmitDropdownProps> {
  readonly columns: Table.DataColumn<R, M>[];
  readonly hiddenColumns?: Table.HiddenColumns;
  readonly onChange?: (field: string, visible: boolean) => void;
}

const ToggleColumnsDropdown = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  props: ToggleColumnsDropdownProps<R, M>
): JSX.Element => {
  const hideableColumns = useMemo<Table.DataColumn<R, M>[]>(
    () => filter(props.columns, (col: Table.DataColumn<R, M>) => col.canBeHidden !== false),
    [props.columns]
  );

  const selected = useMemo<string[]>(
    () =>
      map(
        filter(
          hideableColumns,
          (col: Table.DataColumn<R, M>) => isNil(props.hiddenColumns) || props.hiddenColumns[col.field] !== true
        ),
        (col: Table.DataColumn<R, M>) => col.field
      ) as string[],
    [hideableColumns, props.hiddenColumns]
  );

  return (
    <DropdownMenu<MenuItemSelectedState, ColumnMenuModel>
      {...props}
      mode={"multiple"}
      includeSearch={true}
      setFocusedFromSelectedState={false}
      searchIndices={["label"]}
      clientSearching={true}
      checkbox={true}
      selected={selected as string[]}
      keepDropdownOpenOnClick={true}
      models={map(hideableColumns, (col: Table.DataColumn<R, M>) => ({
        id: col.field,
        label: col.headerName || ""
      }))}
      onChange={(e: MenuChangeEvent<MenuItemSelectedState, ColumnMenuModel>) =>
        props.onChange?.(e.model.id, e.state.selected)
      }
    />
  );
};

export default React.memo(ToggleColumnsDropdown) as typeof ToggleColumnsDropdown;

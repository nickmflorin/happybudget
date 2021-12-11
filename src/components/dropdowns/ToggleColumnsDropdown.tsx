import React, { useMemo } from "react";
import { filter, map, isNil } from "lodash";

import { tabling } from "lib";
import DropdownMenu, { DropdownMenuProps } from "./DropdownMenu";

type OmitDropdownProps = "mode" | "checkbox" | "selected" | "models" | "onChange";

type ColumnMenuModel = {
  readonly id: string;
  readonly label: string;
};

export interface ToggleColumnsDropdownProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>
  extends Omit<DropdownMenuProps<MenuItemSelectedState, ColumnMenuModel>, OmitDropdownProps> {
  readonly columns: Table.Column<R, M>[];
  readonly hiddenColumns?: Table.HiddenColumns;
  readonly onChange?: (field: string, visible: boolean) => void;
}

/* eslint-disable indent */
const ToggleColumnsDropdown = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  props: ToggleColumnsDropdownProps<R, M>
): JSX.Element => {
  const hideableColumns = useMemo<Table.Column<R, M>[]>(
    () =>
      filter(
        props.columns,
        (col: Table.Column<R, M>) =>
          col.canBeHidden !== false &&
          col.tableColumnType !== "fake" &&
          !isNil(tabling.columns.normalizedField<R, M>(col))
      ),
    [props.columns]
  );

  const selected = useMemo<(keyof R | string)[]>(
    () =>
      map(
        filter(hideableColumns, (col: Table.Column<R, M>) => {
          const field = tabling.columns.normalizedField<R, M>(col);
          return !isNil(field) && (isNil(props.hiddenColumns) || props.hiddenColumns[field] !== true);
        }),
        (col: Table.Column<R, M>) => tabling.columns.normalizedField<R, M>(col)
      ) as (keyof R | string)[],
    [hideableColumns, props.hiddenColumns]
  );

  return (
    <DropdownMenu<MenuItemSelectedState, ColumnMenuModel>
      {...props}
      mode={"multiple"}
      includeSearch={true}
      searchIndices={["label"]}
      clientSearching={true}
      checkbox={true}
      selected={selected as string[]}
      keepDropdownOpenOnClick={true}
      models={map(hideableColumns, (col: Table.Column<R, M>) => ({
        id: tabling.columns.normalizedField<R, M>(col) as string,
        label: col.headerName || ""
      }))}
      onChange={(e: MenuChangeEvent<MenuItemSelectedState, ColumnMenuModel>) =>
        props.onChange?.(e.model.id, e.state.selected)
      }
    />
  );
};

export default React.memo(ToggleColumnsDropdown) as typeof ToggleColumnsDropdown;

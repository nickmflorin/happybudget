import { useMemo } from "react";
import { filter, map, includes, isNil } from "lodash";

import { tabling } from "lib";
import Dropdown, { DropdownMenuItemsProps } from "./Dropdown";

type OmitDropdownProps = "menuMode" | "menuCheckbox" | "menuSelected" | "menuItems";
export interface ToggleColumnsDropdownProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>
  extends Omit<DropdownMenuItemsProps, OmitDropdownProps> {
  readonly columns: Table.Column<R, M>[];
  readonly hiddenColumns?: (keyof R | string)[];
}

/* eslint-disable indent */
const ToggleColumnsDropdown = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  props: ToggleColumnsDropdownProps<R, M>
): JSX.Element => {
  const hideableColumns = useMemo<Table.Column<R, M>[]>(
    () =>
      filter(
        props.columns,
        (col: Table.Column<R, M>) =>
          col.canBeHidden !== false && col.tableColumnType !== "fake" && !isNil(tabling.columns.normalizedField(col))
      ),
    [props.columns]
  );

  const selected = useMemo<(keyof R | string)[]>(
    () =>
      map(
        filter(
          hideableColumns,
          (col: Table.Column<R, M>) => !includes(props.hiddenColumns, tabling.columns.normalizedField(col))
        ),
        (col: Table.Column<R, M>) => tabling.columns.normalizedField(col)
      ) as (keyof R | string)[],
    [hideableColumns, props.hiddenColumns]
  );

  return (
    <Dropdown
      {...props}
      menuMode={"multiple"}
      includeSearch={true}
      searchIndices={["label"]}
      clientSearching={true}
      menuCheckbox={true}
      menuSelected={selected as string[]}
      keepDropdownOpenOnClick={true}
      menuItems={map(hideableColumns, (col: Table.Column<R, M>) => ({
        id: tabling.columns.normalizedField(col) as string,
        label: col.headerName || ""
      }))}
    />
  );
};

export default ToggleColumnsDropdown;

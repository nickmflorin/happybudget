import { useMemo } from "react";
import { filter, map, includes } from "lodash";

import Dropdown, { DropdownMenuItemsProps } from "./Dropdown";

type OmitDropdownProps = "menuMode" | "menuCheckbox" | "menuSelected" | "menuItems";
export interface ToggleColumnsDropdownProps<R extends Table.RowData, M extends Model.Model = Model.Model>
  extends Omit<DropdownMenuItemsProps, OmitDropdownProps> {
  readonly columns: Table.Column<R, M>[];
  readonly hiddenColumns?: (keyof R)[];
}

/* eslint-disable indent */
const ToggleColumnsDropdown = <R extends Table.RowData, M extends Model.Model = Model.Model>(
  props: ToggleColumnsDropdownProps<R, M>
): JSX.Element => {
  const hideableColumns = useMemo<Table.Column<R, M>[]>(
    () => filter(props.columns, (col: Table.Column<R, M>) => col.canBeHidden !== false),
    [props.columns]
  );

  const selected = useMemo<(keyof R)[]>(
    () =>
      map(
        filter(hideableColumns, (col: Table.Column<R, M>) => !includes(props.hiddenColumns, col.field)),
        (col: Table.Column<R, M>) => col.field
      ),
    [hideableColumns, props.hiddenColumns]
  );

  return (
    <Dropdown
      {...props}
      menuMode={"multiple"}
      includeSearch={true}
      searchIndices={["label"]}
      menuCheckbox={true}
      menuSelected={selected as string[]}
      menuItems={map(hideableColumns, (col: Table.Column<R, M>) => ({
        id: col.field as string,
        label: col.headerName || ""
      }))}
    />
  );
};

export default ToggleColumnsDropdown;
